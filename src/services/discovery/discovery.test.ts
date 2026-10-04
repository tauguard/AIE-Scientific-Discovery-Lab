/**
 * Comprehensive Unit Test Suite for Scientific Discovery Phase 2
 * 
 * Verifies:
 * 1. Research Agent structured schema output
 * 2. Hypothesis Agent output matching ScientificHypothesis
 * 3. Experiment Planner producing valid ExperimentPlan compatible with computationalExperimentEngine
 * 4. Deterministic utility scoring and experiment selection
 * 5. Deterministic result analysis and Bayesian hypothesis updates (SUPPORTED, CONTRADICTED, INCONCLUSIVE)
 * 6. Full single-iteration orchestration flow
 */

import { ScientificQuestion, ExperimentPlan, ComputationalResult, ScientificHypothesis } from '../../types/discovery';
import { generateResearchSummary } from './researchAgent';
import { generateHypotheses } from './hypothesisAgent';
import { generateCandidateExperimentPlans } from './experimentPlanner';
import { selectBestExperiment, calculateExperimentUtility } from './experimentSelector';
import { analyzeResults } from './resultAnalyzer';
import { runFullDiscoveryIteration, decideNextExperiment } from './discoveryOrchestrator';
import { runComputationalExperiment } from '../../utils/computationalExperimentEngine';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

async function runDiscoveryPhase2Tests(): Promise<void> {
  console.log('🧪 Starting Discovery Agent Layer (Phase 2) Test Suite...\n');
  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
    total++;
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✕ ${name}`);
      console.error(`    ${err?.message || err}`);
    }
  }

  const sampleQuestion: ScientificQuestion = {
    id: 'Q-TEST-01',
    timestamp: new Date().toISOString(),
    domain: 'materials_science',
    title: 'Superconducting Critical Temperature Optimization',
    rawInquiry: 'How does carrier doping concentration x optimize Tc in strong-coupling superconductors?',
    targetObjective: 'Maximize critical transition temperature Tc under structural stability constraints',
    primaryVariable: 'doping_concentration_x',
    targetMetric: 'critical_temperature_Tc'
  };

  // --- Test 1: Research Agent Structured Schema Output ---
  await test('Research Agent produces valid, epistemically grounded ResearchSummary', async () => {
    const research = await generateResearchSummary(sampleQuestion);

    assert(research.questionId === sampleQuestion.id, 'questionId must match input question');
    assert(typeof research.theoreticalFramework === 'string' && research.theoreticalFramework.length > 0, 'theoreticalFramework must be non-empty');
    assert(Array.isArray(research.governingEquations) && research.governingEquations.length >= 2, 'governingEquations must have at least 2 formulas');
    assert(Array.isArray(research.knownInformation) && research.knownInformation.length >= 2, 'knownInformation must be populated');
    assert(Array.isArray(research.unknownInformation) && research.unknownInformation.length >= 2, 'unknownInformation must be populated');
    assert(Array.isArray(research.assumptions) && research.assumptions.length >= 2, 'assumptions must be populated');
    assert(Array.isArray(research.evidence) && research.evidence.length >= 1, 'evidence must be populated');
    assert(Array.isArray(research.researchGaps) && research.researchGaps.length >= 1, 'researchGaps must be populated');
    assert(Array.isArray(research.openQuestions) && research.openQuestions.length >= 1, 'openQuestions must be populated');
    assert(Array.isArray(research.knownInvariants) && research.knownInvariants.length >= 2, 'knownInvariants must be populated');
    assert(research.epistemicStatus === 'MODEL-DEPENDENT' || research.epistemicStatus === 'VERIFIED', 'epistemicStatus must be MODEL-DEPENDENT or VERIFIED');
  });

  // --- Test 2: Hypothesis Agent Output Matching ScientificHypothesis ---
  await test('Hypothesis Agent formulates 3 distinct, falsifiable hypotheses with causal mechanisms', async () => {
    const research = await generateResearchSummary(sampleQuestion);
    const hypotheses = await generateHypotheses(sampleQuestion, research);

    assert(Array.isArray(hypotheses) && hypotheses.length === 3, 'Must produce exactly 3 hypotheses');

    let totalPrior = 0;
    hypotheses.forEach((hyp, idx) => {
      assert(hyp.id.startsWith('HYP-'), `Hypothesis ${idx} must have valid ID prefix`);
      assert(hyp.questionId === sampleQuestion.id, 'questionId must match');
      assert(typeof hyp.statement === 'string' && hyp.statement.length > 10, 'statement must be substantive');
      assert(typeof hyp.mechanism === 'string' && hyp.mechanism.length > 10, 'mechanism must describe causal pathway');
      assert(typeof hyp.predictedOptimalParameter === 'number', 'predictedOptimalParameter must be a number');
      assert(typeof hyp.predictedMetricValue === 'number' && hyp.predictedMetricValue > 0, 'predictedMetricValue must be positive number');
      assert(typeof hyp.tolerance === 'number' && hyp.tolerance > 0, 'tolerance must be positive');
      assert(typeof hyp.formalCausalRelation === 'string' && hyp.formalCausalRelation.includes('do('), 'formalCausalRelation must use Pearl do() notation');
      assert(hyp.epistemicLevel === 'MODEL-DEPENDENT', 'epistemicLevel must be MODEL-DEPENDENT');
      assert(hyp.status === 'PENDING', 'Initial status must be PENDING');
      assert(typeof hyp.falsificationCriteria === 'string' && hyp.falsificationCriteria.length > 5, 'falsificationCriteria must be defined');

      totalPrior += hyp.priorConfidence;
    });

    assert(Math.abs(totalPrior - 1.0) < 0.1, `Priors must sum close to 1.0 (got ${totalPrior})`);
  });

  // --- Test 3: Experiment Planner Compatibility ---
  await test('Experiment Planner produces valid ExperimentPlan candidates compatible with computational engine', async () => {
    const research = await generateResearchSummary(sampleQuestion);
    const hypotheses = await generateHypotheses(sampleQuestion, research);
    const plans = await generateCandidateExperimentPlans(sampleQuestion, hypotheses, research);

    assert(Array.isArray(plans) && plans.length >= 2, 'Planner must produce at least 2 candidate plans');

    for (const plan of plans) {
      assert(plan.benchmarkModel === 'mcmillan_superconductor' || plan.benchmarkModel === 'michaelis_menten', 'Must specify supported benchmarkModel');
      assert(plan.primaryParameter.min < plan.primaryParameter.max, 'Parameter min must be strictly less than max');
      assert(plan.primaryParameter.step > 0, 'Parameter step must be positive');
      assert(plan.numericalSteps >= 5, 'numericalSteps must be at least 5');
      assert(plan.informationGain !== undefined && plan.informationGain >= 0 && plan.informationGain <= 1, 'informationGain must be in [0, 1]');
      assert(plan.hypothesisDiscrimination !== undefined && plan.hypothesisDiscrimination >= 0 && plan.hypothesisDiscrimination <= 1, 'hypothesisDiscrimination must be in [0, 1]');
      assert(plan.feasibility !== undefined && plan.feasibility >= 0 && plan.feasibility <= 1, 'feasibility must be in [0, 1]');
      assert(plan.cost !== undefined && plan.cost >= 0 && plan.cost <= 1, 'cost must be in [0, 1]');
      assert(plan.risk !== undefined && plan.risk >= 0 && plan.risk <= 1, 'risk must be in [0, 1]');

      // Direct execution verification with the deterministic engine
      const execResult = runComputationalExperiment(plan);
      assert(execResult.success === true, `Candidate plan "${plan.id}" must execute successfully in computational engine`);
      assert(execResult.dataPoints.length > 0, 'Data points must be generated');
    }
  });

  // --- Test 4: Utility Scoring & Deterministic Experiment Selection ---
  await test('Deterministic Experiment Selector scores and selects the optimal candidate plan', async () => {
    const candidateA: ExperimentPlan = {
      id: 'EXP-LOW-UTILITY',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-01'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Low Utility Plan',
      description: 'High cost and risk, low discrimination',
      primaryParameter: { name: 'x', symbol: 'x', min: 0.1, max: 0.2, step: 0.02, unit: 'ratio', description: 'x' },
      fixedParameters: {},
      numericalSteps: 5,
      informationGain: 0.4,
      hypothesisDiscrimination: 0.3,
      feasibility: 0.5,
      cost: 0.8,
      risk: 0.7
    };

    const candidateB: ExperimentPlan = {
      id: 'EXP-HIGH-UTILITY',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-01', 'HYP-02'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'High Utility Plan',
      description: 'High information gain and discrimination with minimal cost',
      primaryParameter: { name: 'x', symbol: 'x', min: 0.05, max: 0.35, step: 0.01, unit: 'ratio', description: 'x' },
      fixedParameters: {},
      numericalSteps: 30,
      informationGain: 0.95,
      hypothesisDiscrimination: 0.90,
      feasibility: 0.95,
      cost: 0.15,
      risk: 0.05
    };

    const utilA = calculateExperimentUtility(candidateA);
    const utilB = calculateExperimentUtility(candidateB);

    assert(utilB.score > utilA.score, `Candidate B score (${utilB.score}) must exceed Candidate A (${utilA.score})`);

    const selectionResult = selectBestExperiment([candidateA, candidateB]);

    assert(selectionResult.selectedExperiment.id === 'EXP-HIGH-UTILITY', 'Highest utility candidate must be selected');
    assert(selectionResult.utilityScores.length === 2, 'Both candidates must be scored in audit');
    assert(selectionResult.selectionReason.includes('EXP-HIGH-UTILITY'), 'Selection reason must explicitly reference the winner');
  });

  // --- Test 5: Deterministic Result Analysis & Bayesian Hypothesis Updates ---
  await test('Result Analyzer updates hypothesis confidences based on empirical residuals', async () => {
    const testHypotheses: ScientificHypothesis[] = [
      {
        id: 'HYP-MATCH',
        questionId: 'Q-01',
        title: 'Accurate Resonance Hypothesis',
        statement: 'Predicts peak near x = 0.21 with Tc = 63.0 K',
        mechanism: 'Strong coupling resonance near critical doping',
        predictedOptimalParameter: 0.21,
        predictedMetricValue: 63.0,
        tolerance: 5.0,
        assumptions: ['Metastable lattice stability holds across resonance'],
        testabilityScore: 0.95,
        epistemicLevel: 'MODEL-DEPENDENT',
        formalCausalRelation: 'do(x) -> Tc(x)',
        priorConfidence: 0.50,
        falsificationCriteria: 'Residual error > tolerance',
        status: 'PENDING'
      },
      {
        id: 'HYP-MISMATCH',
        questionId: 'Q-01',
        title: 'Inaccurate Low-Doping Hypothesis',
        statement: 'Predicts peak at x = 0.08 with Tc = 20.0 K',
        mechanism: 'Acoustic mode softening at low carrier injection',
        predictedOptimalParameter: 0.08,
        predictedMetricValue: 20.0,
        tolerance: 4.0,
        assumptions: ['Acoustic mode softening dominates at low doping'],
        testabilityScore: 0.90,
        epistemicLevel: 'MODEL-DEPENDENT',
        formalCausalRelation: 'do(x) -> Tc(x)',
        priorConfidence: 0.50,
        falsificationCriteria: 'Residual error > tolerance',
        status: 'PENDING'
      }
    ];

    const plan: ExperimentPlan = {
      id: 'EXP-EVAL',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-MATCH', 'HYP-MISMATCH'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Validation Sweep',
      description: 'Verifying result analyzer verdicts',
      primaryParameter: { name: 'x', symbol: 'x', min: 0.05, max: 0.35, step: 0.01, unit: 'ratio', description: 'x' },
      fixedParameters: { x_resonance_center: 0.215 },
      numericalSteps: 30
    };

    const compResult = runComputationalExperiment(plan);
    assert(compResult.success === true, 'Computation must succeed');

    const observation = analyzeResults(plan, compResult, testHypotheses);

    assert(observation.hypothesisEvaluations.length === 2, 'Must evaluate both hypotheses');

    const evalMatch = observation.hypothesisEvaluations.find(e => e.hypothesisId === 'HYP-MATCH');
    const evalMismatch = observation.hypothesisEvaluations.find(e => e.hypothesisId === 'HYP-MISMATCH');

    assert(evalMatch !== undefined && evalMismatch !== undefined, 'Both hypotheses must have evaluations');
    assert(evalMatch!.verdict === 'SUPPORTED', `HYP-MATCH must be SUPPORTED, got ${evalMatch!.verdict}`);
    assert(evalMismatch!.verdict === 'CONTRADICTED', `HYP-MISMATCH must be CONTRADICTED, got ${evalMismatch!.verdict}`);
    assert(evalMatch!.updatedConfidence > evalMatch!.priorConfidence, 'Supported hypothesis confidence must increase');
    assert(evalMismatch!.updatedConfidence < evalMismatch!.priorConfidence, 'Contradicted hypothesis confidence must decrease');
    assert(typeof observation.synthesis === 'string' && observation.synthesis.length > 20, 'Synthesis must be generated');

    // Test Failure / Inconclusive handling
    const failedResult: ComputationalResult = {
      ...compResult,
      success: false,
      dataPoints: [],
      errorMessage: 'Simulated numerical divergence'
    };

    const failureObservation = analyzeResults(plan, failedResult, testHypotheses);
    assert(failureObservation.hypothesisEvaluations.every(e => e.verdict === 'INCONCLUSIVE'), 'Failed experiment must produce INCONCLUSIVE evaluations');
  });

  // --- Test 6: Full Single-Iteration Orchestration Flow ---
  await test('Full Discovery Orchestrator executes end-to-end iteration loop', async () => {
    const iteration = await runFullDiscoveryIteration(sampleQuestion, undefined, 1);

    assert(iteration.iterationNumber === 1, 'Iteration number must be 1');
    assert(iteration.question.id === sampleQuestion.id, 'Question ID must match');
    assert(iteration.researchSummary !== undefined, 'ResearchSummary must be present');
    assert(Array.isArray(iteration.hypotheses) && iteration.hypotheses.length >= 2, 'Hypotheses must be present');
    assert(iteration.experimentPlan !== undefined, 'ExperimentPlan must be selected');
    assert(iteration.selectionResult !== undefined, 'SelectionResult must be present');
    assert(iteration.computationalResult.success === true, 'Computational experiment must succeed');
    assert(iteration.computationalResult.dataPoints.length > 0, 'Computational data points must exist');
    assert(iteration.observationUpdate.hypothesisEvaluations.length > 0, 'Observation evaluations must exist');
    assert(iteration.nextExperimentDecision !== undefined, 'NextExperimentDecision must be formulated');

    // Verify next experiment recommended range zooms around observed optimum
    const optimalX = iteration.computationalResult.optimalObservation.parameterValue;
    const nextDecision = iteration.nextExperimentDecision!;
    assert(typeof nextDecision.remainingUncertainty === 'number', 'remainingUncertainty must be calculated');
    assert(nextDecision.recommendedParameterRange.min < optimalX && optimalX < nextDecision.recommendedParameterRange.max,
      `Recommended range [${nextDecision.recommendedParameterRange.min}, ${nextDecision.recommendedParameterRange.max}] must bracket observed optimum ${optimalX}`);
    assert(nextDecision.candidateExperiments.length > 0, 'Follow-up candidate experiments must be proposed');
  });

  console.log(`\n📊 Discovery Phase 2 Test Results: ${passed}/${total} passed (${((passed / total) * 100).toFixed(0)}% success rate)\n`);

  if (passed !== total) {
    throw new Error(`Only ${passed}/${total} tests passed!`);
  }
}

runDiscoveryPhase2Tests().catch(err => {
  console.error('Fatal Discovery test error:', err);
  process.exit(1);
});
