/**
 * Discovery Orchestrator (AIE v1.0 Discovery Extension)
 * Databricks Agentic Scientific Discovery Benchmark
 * 
 * Pipeline:
 * USER QUESTION
 *       ↓
 * RESEARCH AGENT
 *       ↓
 * HYPOTHESIS AGENT (or CARRY-FORWARD CONTINUITY for Iteration N >= 2)
 *       ↓
 * EXPERIMENT PLANNER (or Follow-Up Candidate Selection)
 *       ↓
 * NEXT EXPERIMENT SELECTOR
 *       ↓
 * DETERMINISTIC EXPERIMENT ENGINE
 *       ↓
 * RESULT ANALYZER (Bayesian update applied to prior iteration's confidence)
 *       ↓
 * NEXT EXPERIMENT DECISION & ITERATION SYNTHESIS
 */

import {
  ScientificQuestion,
  ResearchSummary,
  ScientificHypothesis,
  ExperimentPlan,
  ExperimentSelectionResult,
  ComputationalResult,
  ObservationUpdate,
  NextExperimentDecision,
  DiscoveryIteration
} from '../../types/discovery';
import { generateResearchSummary, GeminiCaller } from './researchAgent';
import { generateHypotheses } from './hypothesisAgent';
import { generateCandidateExperimentPlans } from './experimentPlanner';
import { selectBestExperiment } from './experimentSelector';
import { analyzeResults } from './resultAnalyzer';
import { runComputationalExperiment } from '../../utils/computationalExperimentEngine';

export interface DiscoveryIterationOptions {
  previousHypotheses?: ScientificHypothesis[];
  previousIteration?: DiscoveryIteration;
  candidatePlans?: ExperimentPlan[];
}

/**
 * Verifies that existing hypothesis IDs are preserved across iterations.
 * Guarantees that multi-round discovery tracks the exact same hypothesis identities
 * (e.g. HYP-01, HYP-02, HYP-03) rather than regenerating unrelated hypotheses.
 */
export function verifyHypothesisContinuity(
  previousHypotheses: ScientificHypothesis[],
  currentHypotheses: ScientificHypothesis[]
): boolean {
  if (!previousHypotheses || previousHypotheses.length === 0) return true;
  if (!currentHypotheses || currentHypotheses.length === 0) {
    throw new Error('Hypothesis continuity violation: Current hypothesis set is empty while previous iteration had hypotheses.');
  }

  const prevIds = previousHypotheses.map(h => h.id);
  const currIds = currentHypotheses.map(h => h.id);

  if (prevIds.length !== currIds.length) {
    throw new Error(
      `Hypothesis continuity violation: Hypothesis count mismatch between iterations (previous: ${prevIds.length} [${prevIds.join(', ')}], current: ${currIds.length} [${currIds.join(', ')}]).`
    );
  }

  for (let i = 0; i < prevIds.length; i++) {
    if (prevIds[i] !== currIds[i]) {
      throw new Error(
        `Hypothesis ID integrity violated across iterations at index ${i}: expected '${prevIds[i]}' but found '${currIds[i]}'. Existing hypothesis IDs must be preserved.`
      );
    }
  }

  return true;
}

/**
 * Carries forward previous hypotheses into the new iteration:
 * - Preserves hypothesis identity, mechanism, parameters, and falsification criteria
 * - Sets priorConfidence = previous posteriorConfidence (or priorConfidence if posterior was undefined)
 * - Guarantees that subsequent Bayesian updates are applied to the previous iteration's confidence levels
 */
export function carryForwardHypotheses(
  previousHypotheses: ScientificHypothesis[]
): ScientificHypothesis[] {
  return previousHypotheses.map(h => {
    const carriedConfidence = h.posteriorConfidence !== undefined ? h.posteriorConfidence : h.priorConfidence;
    return {
      ...h,
      priorConfidence: carriedConfidence,
      status: 'PENDING'
    };
  });
}

/**
 * Calculates remaining epistemic uncertainty and proposes the next refined parameter corridor.
 */
export function decideNextExperiment(
  plan: ExperimentPlan,
  result: ComputationalResult,
  hypotheses: ScientificHypothesis[],
  observation: ObservationUpdate
): NextExperimentDecision {
  const nextExpId = `EXP-NEXT-${Date.now().toString(36).slice(-4).toUpperCase()}`;

  if (!result.success || observation.hypothesisEvaluations.length === 0) {
    return {
      nextExperimentId: nextExpId,
      reason: 'Previous experiment encountered numerical failure or produced inconclusive results. Propose parameter recalibration.',
      remainingUncertainty: 0.95,
      recommendedParameterRange: {
        min: plan.primaryParameter.min,
        max: plan.primaryParameter.max,
        step: plan.primaryParameter.step
      },
      candidateExperiments: []
    };
  }

  // Calculate Shannon-like uncertainty from posterior confidences:
  // H = -sum(p * log2(p)) / log2(N)
  const confidences = observation.hypothesisEvaluations.map(e => Math.max(0.01, e.updatedConfidence));
  const sumConf = confidences.reduce((a, b) => a + b, 0);
  const normalized = confidences.map(c => c / sumConf);
  const n = normalized.length;
  const entropy = -normalized.reduce((acc, p) => acc + p * Math.log2(p), 0);
  const maxEntropy = n > 1 ? Math.log2(n) : 1;
  const normalizedUncertainty = Number(Math.min(1.0, Math.max(0.05, entropy / maxEntropy)).toFixed(4));

  const optimalParam = result.optimalObservation.parameterValue;
  const currentStep = plan.primaryParameter.step;
  const halfWindow = Math.max(currentStep * 4, (plan.primaryParameter.max - plan.primaryParameter.min) * 0.25);

  const minNarrowed = Number(Math.max(plan.primaryParameter.min * 0.5, optimalParam - halfWindow).toFixed(4));
  const maxNarrowed = Number(Math.min(plan.primaryParameter.max * 1.5, optimalParam + halfWindow).toFixed(4));
  const refinedStep = Number(Math.max(0.001, currentStep * 0.5).toFixed(4));

  const topHypothesis = [...observation.hypothesisEvaluations].sort((a, b) => b.updatedConfidence - a.updatedConfidence)[0];

  const reason = topHypothesis && topHypothesis.verdict === 'SUPPORTED'
    ? `Hypothesis ${topHypothesis.hypothesisId} strongly supported near parameter = ${optimalParam}. Recommended follow-up: fine-grained micro-sweep around [${minNarrowed}, ${maxNarrowed}] with step ${refinedStep} to confirm exact resonance curvature.`
    : `Empirical optimum observed at parameter = ${optimalParam}. Discriminating remaining hypotheses requires zoomed sweep around [${minNarrowed}, ${maxNarrowed}].`;

  const followUpPlan: ExperimentPlan = {
    id: nextExpId,
    questionId: plan.questionId,
    hypothesisIds: hypotheses.map(h => h.id),
    benchmarkModel: plan.benchmarkModel,
    title: `Follow-Up Precision Zoom around x = ${optimalParam}`,
    description: `Refined parameter sweep centered on observed optimum ${optimalParam} to resolve residual epistemic uncertainty (${(normalizedUncertainty * 100).toFixed(1)}%).`,
    objective: 'Confirm peak stability and rule out secondary local extrema.',
    variables: [plan.primaryParameter.symbol, 'metric_value'],
    primaryParameter: {
      name: `Refined ${plan.primaryParameter.name}`,
      symbol: plan.primaryParameter.symbol,
      min: minNarrowed,
      max: maxNarrowed,
      step: refinedStep,
      unit: plan.primaryParameter.unit,
      description: `Narrowed sweep range around empirical maximum ${optimalParam}`
    },
    fixedParameters: { ...plan.fixedParameters },
    numericalSteps: Math.min(40, Math.max(10, Math.round((maxNarrowed - minNarrowed) / refinedStep))),
    informationGain: 0.98,
    hypothesisDiscrimination: 0.95,
    feasibility: 0.98,
    cost: 0.08,
    risk: 0.03
  };

  const secondaryCheckPlan: ExperimentPlan = {
    id: `EXP-ALT-${Date.now().toString(36).toUpperCase().slice(-4)}`,
    questionId: plan.questionId,
    hypothesisIds: hypotheses.map(h => h.id),
    benchmarkModel: plan.benchmarkModel,
    title: `Asymmetric Shoulder Confirmation Sweep`,
    description: `Extended sweep on the high-doping shoulder to verify monotonic descent.`,
    objective: 'Rule out secondary resonance shoulders.',
    variables: [plan.primaryParameter.symbol, 'metric_value'],
    primaryParameter: {
      name: `Shoulder ${plan.primaryParameter.name}`,
      symbol: plan.primaryParameter.symbol,
      min: optimalParam,
      max: Number(Math.min(plan.primaryParameter.max, optimalParam + halfWindow * 1.5).toFixed(4)),
      step: Number((refinedStep * 1.5).toFixed(4)),
      unit: plan.primaryParameter.unit,
      description: `Shoulder verification sweep`
    },
    fixedParameters: { ...plan.fixedParameters },
    numericalSteps: 15,
    informationGain: 0.84,
    hypothesisDiscrimination: 0.86,
    feasibility: 0.92,
    cost: 0.18,
    risk: 0.06
  };

  return {
    nextExperimentId: nextExpId,
    reason,
    remainingUncertainty: normalizedUncertainty,
    recommendedParameterRange: {
      min: minNarrowed,
      max: maxNarrowed,
      step: refinedStep
    },
    candidateExperiments: [followUpPlan, secondaryCheckPlan]
  };
}

/**
 * Runs a complete, end-to-end single iteration of the scientific discovery pipeline:
 * Question -> Research -> Hypotheses -> Candidate Plans -> Select Best Plan
 * -> Deterministic Computation -> Result Analysis & Bayesian Update -> Next Experiment Decision
 * 
 * In multi-iteration workflows (iterationNumber >= 2 or when previousHypotheses/previousIteration are supplied):
 * 1. Verifies that existing hypothesis IDs are preserved across iterations.
 * 2. Applies Bayesian posterior updates to the previous iteration's hypothesis confidence levels (as new priors).
 * 3. Does NOT generate new hypothesis sets from scratch.
 * 4. Carries forward follow-up candidate experiment plans (e.g. from previous nextExperimentDecision).
 */
export async function runFullDiscoveryIteration(
  question: ScientificQuestion,
  callGeminiFn?: GeminiCaller,
  iterationNumber = 1,
  optionsOrHypotheses?: ScientificHypothesis[] | DiscoveryIterationOptions
): Promise<DiscoveryIteration> {
  // Extract previous iteration context if provided
  let previousHypotheses: ScientificHypothesis[] | undefined;
  let candidatePlans: ExperimentPlan[] | undefined;

  if (Array.isArray(optionsOrHypotheses)) {
    previousHypotheses = optionsOrHypotheses;
  } else if (optionsOrHypotheses) {
    previousHypotheses = optionsOrHypotheses.previousHypotheses || optionsOrHypotheses.previousIteration?.hypotheses;
    candidatePlans = optionsOrHypotheses.candidatePlans || optionsOrHypotheses.previousIteration?.nextExperimentDecision?.candidateExperiments;
  }

  // Step 1: Research Agent (Epistemic grounding)
  const researchSummary = await generateResearchSummary(question, callGeminiFn);

  // Step 2: Hypothesis Agent or Carry-Forward Continuity
  let initialHypotheses: ScientificHypothesis[];
  if (previousHypotheses && previousHypotheses.length > 0) {
    // Preserve existing hypothesis IDs and use previous posteriors as new priors
    initialHypotheses = carryForwardHypotheses(previousHypotheses);
    // Explicit verification of hypothesis ID preservation
    verifyHypothesisContinuity(previousHypotheses, initialHypotheses);
  } else {
    // First iteration or no prior hypotheses: generate hypothesis set
    initialHypotheses = await generateHypotheses(question, researchSummary, callGeminiFn);
  }

  // Step 3: Experiment Planning / Candidate Experiments
  let plansToSelectFrom: ExperimentPlan[];
  if (candidatePlans && candidatePlans.length > 0) {
    plansToSelectFrom = candidatePlans;
  } else {
    plansToSelectFrom = await generateCandidateExperimentPlans(question, initialHypotheses, researchSummary, callGeminiFn);
  }

  // Step 4: Next Experiment Selector (Deterministic utility calculation & ranking)
  const selectionResult: ExperimentSelectionResult = selectBestExperiment(plansToSelectFrom);
  const selectedPlan = selectionResult.selectedExperiment;

  // Step 5: Deterministic Experiment Engine (Real numerical calculation)
  const computationalResult: ComputationalResult = runComputationalExperiment(selectedPlan);

  // Step 6: Result Analyzer (Deterministic Bayesian update against empirical residuals)
  // When previousHypotheses were provided, initialHypotheses[i].priorConfidence was initialized
  // from the previous iteration's posterior confidence, so the update applies directly to the prior state.
  const observationUpdate: ObservationUpdate = analyzeResults(selectedPlan, computationalResult, initialHypotheses);

  // Update hypotheses in-place with posterior confidences and updated status
  const updatedHypotheses: ScientificHypothesis[] = initialHypotheses.map(hyp => {
    const evalResult = observationUpdate.hypothesisEvaluations.find(e => e.hypothesisId === hyp.id);
    if (!evalResult) return hyp;

    return {
      ...hyp,
      posteriorConfidence: evalResult.updatedConfidence,
      status: evalResult.verdict
    };
  });

  // Verify that hypothesis IDs are preserved post-analysis
  verifyHypothesisContinuity(initialHypotheses, updatedHypotheses);
  if (previousHypotheses && previousHypotheses.length > 0) {
    verifyHypothesisContinuity(previousHypotheses, updatedHypotheses);
  }

  // Step 7: Next Experiment Decision
  const nextExperimentDecision = decideNextExperiment(
    selectedPlan,
    computationalResult,
    updatedHypotheses,
    observationUpdate
  );

  return {
    iterationNumber,
    question,
    researchSummary,
    hypotheses: updatedHypotheses,
    experimentPlan: selectedPlan,
    selectionResult,
    computationalResult,
    observationUpdate,
    nextExperimentDecision
  };
}
