/**
 * Deterministic Result Analyzer (AIE v1.0 Discovery Extension)
 * 
 * Compares empirical computational results against prior hypothesis predictions.
 * Computes deterministic Bayesian posterior confidence updates and classification verdicts
 * (SUPPORTED, PARTIALLY_SUPPORTED, CONTRADICTED, INCONCLUSIVE).
 * 
 * Strict Mathematical Guarantees:
 * - Independent evaluation of parameter agreement vs. metric agreement
 * - Exact parameter match (diff < 1e-5) NEVER contributes contradiction and preserves/increases confidence
 * - Parameter within acceptable window is NEVER classified as parameter contradiction
 * - Floating-point tolerance prevents precision artifacts
 * - Zero LLM hallucination: Confidence changes are mathematically derived from observed residuals
 */

import { 
  ExperimentPlan, 
  ComputationalResult, 
  ScientificHypothesis, 
  ObservationUpdate,
  HypothesisObservationEvaluation 
} from '../../types/discovery';

/**
 * Helper to determine parameter tolerance sigmaX in primary variable units.
 */
export function resolveParameterTolerance(h: ScientificHypothesis): number {
  if (h.parameterTolerance !== undefined && h.parameterTolerance > 0) {
    return h.parameterTolerance;
  }
  if (h.acceptableWindow && Array.isArray(h.acceptableWindow) && h.acceptableWindow.length === 2) {
    return Math.abs(h.acceptableWindow[1] - h.acceptableWindow[0]) / 2;
  }
  if (h.tolerance !== undefined && h.tolerance > 0) {
    // If parameter value is a ratio in [0, 1] and tolerance was specified in percentage points (> 1)
    if (Math.abs(h.predictedOptimalParameter) <= 1.0 && h.tolerance > 1.0) {
      return h.tolerance / 100;
    }
    return h.tolerance;
  }
  return 0.035;
}

/**
 * Helper to determine metric tolerance sigmaMetric in target metric units.
 */
export function resolveMetricTolerance(h: ScientificHypothesis): number {
  if (h.metricTolerance !== undefined && h.metricTolerance > 0) {
    return h.metricTolerance;
  }
  // If tolerance > 1.0 and predicted metric is large, tolerance may be in metric units
  if (h.tolerance !== undefined && h.tolerance >= 1.0 && Math.abs(h.predictedMetricValue) > 10.0) {
    return Math.max(h.tolerance, Math.abs(h.predictedMetricValue) * 0.10);
  }
  return Math.max(5.0, Math.abs(h.predictedMetricValue) * 0.15);
}

/**
 * Deterministically analyzes computational results and updates hypothesis confidences.
 */
export function analyzeResults(
  plan: ExperimentPlan,
  result: ComputationalResult,
  hypotheses: ScientificHypothesis[]
): ObservationUpdate {
  const timestamp = new Date().toISOString();
  const experimentId = plan?.id || result?.experimentId || 'EXP-UNKNOWN';

  // Failure / Inconclusive handling if calculation failed
  if (!result || !result.success || result.dataPoints.length === 0) {
    const fallbackEvaluations: HypothesisObservationEvaluation[] = hypotheses.map(h => ({
      hypothesisId: h.id,
      predictedParameter: h.predictedOptimalParameter,
      predictedMetric: h.predictedMetricValue,
      observedParameterDiff: 0,
      observedMetricDiff: 0,
      parameterNormalizedError: 0,
      metricNormalizedError: 0,
      normalizedError: 99.0,
      priorConfidence: h.priorConfidence,
      updatedConfidence: h.priorConfidence,
      verdict: 'INCONCLUSIVE',
      evaluationNotes: `Computation failed or aborted: ${result?.errorMessage || 'No valid simulation data produced'}. Hypotheses retained in inconclusive state.`
    }));

    return {
      experimentId,
      timestamp,
      observedOptimumParameter: 0,
      observedOptimumMetric: 0,
      hypothesisEvaluations: fallbackEvaluations,
      synthesis: `Experiment ${experimentId} failed to produce valid numerical output. Confidence levels unchanged.`
    };
  }

  const observedX = result.optimalObservation.parameterValue;
  const observedMetric = result.optimalObservation.metricValue;

  // 1. Calculate raw errors and likelihoods for each hypothesis
  const rawEvaluations = hypotheses.map(h => {
    // Floating-point tolerant distance calculations
    const diffXRaw = Math.abs(observedX - h.predictedOptimalParameter);
    const isExactParameterMatch = diffXRaw < 1e-5;
    const diffX = isExactParameterMatch ? 0.0 : diffXRaw;

    const diffMetricRaw = Math.abs(observedMetric - h.predictedMetricValue);
    const isExactMetricMatch = diffMetricRaw < 1e-5;
    const diffMetric = isExactMetricMatch ? 0.0 : diffMetricRaw;

    const sigmaX = resolveParameterTolerance(h);
    const sigmaMetric = resolveMetricTolerance(h);

    const windowMin = h.acceptableWindow ? h.acceptableWindow[0] : Number((h.predictedOptimalParameter - sigmaX).toFixed(4));
    const windowMax = h.acceptableWindow ? h.acceptableWindow[1] : Number((h.predictedOptimalParameter + sigmaX).toFixed(4));

    // Dimensionally normalized parameter error: e_x = diffX / sigmaX
    const e_x = isExactParameterMatch ? 0.0 : diffX / (sigmaX || 0.001);

    // Dimensionally normalized metric error: e_y = diffMetric / sigmaMetric
    const e_y = isExactMetricMatch ? 0.0 : diffMetric / (sigmaMetric || 1.0);

    // Composite normalized error (parameter location weighted primary for optimization sweeps)
    const compositeError = Math.sqrt(Math.pow(e_x, 2) + Math.pow(0.25 * e_y, 2));

    // Gaussian likelihood L = exp(-0.5 * e^2)
    const likelihood = Math.exp(-0.5 * Math.pow(compositeError, 2));

    // Strict parameter window check with numerical floating-point epsilon
    const isInsideWindow = isExactParameterMatch || (observedX >= windowMin - 1e-5 && observedX <= windowMax + 1e-5);

    // Categorical classification based on explicit mathematical rules
    let verdict: 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'CONTRADICTED' | 'INCONCLUSIVE';

    if (isInsideWindow) {
      // Rule 1: Parameter is within acceptable window
      // Must NOT be classified as parameter contradiction
      if (e_y <= 3.0) {
        // Supported: parameter within window AND metric sufficiently consistent
        verdict = 'SUPPORTED';
      } else {
        // Partial/Mixed evidence: parameter agrees but metric evidence has residual discrepancy
        verdict = 'PARTIALLY_SUPPORTED';
      }
    } else if (e_x <= 1.20) {
      // Near window boundary (marginal / partial alignment)
      verdict = 'PARTIALLY_SUPPORTED';
    } else {
      // Rule 2: Clearly outside acceptable parameter window -> Contradicted
      verdict = 'CONTRADICTED';
    }

    return {
      hypothesis: h,
      diffX: Number(diffX.toFixed(5)),
      diffMetric: Number(diffMetric.toFixed(5)),
      sigmaX: Number(sigmaX.toFixed(4)),
      sigmaMetric: Number(sigmaMetric.toFixed(2)),
      windowMin,
      windowMax,
      isExactParameterMatch,
      isExactMetricMatch,
      isInsideWindow,
      e_x: Number(e_x.toFixed(4)),
      e_y: Number(e_y.toFixed(4)),
      normalizedError: Number(compositeError.toFixed(4)),
      likelihood: Math.max(0.0001, likelihood),
      verdict
    };
  });

  // 2. Deterministic Bayesian posterior normalization: P(H|E) = (P(H) * L) / (Sum(P(H_j) * L_j) + P(H_0) * L_0)
  // P(H_0) represents the epistemic probability mass for unexpected alternative mechanisms
  const p_h0 = 0.15;
  const l_h0 = Math.exp(-0.5); // 0.6065
  const unmodeledMass = p_h0 * l_h0;

  const unnormalizedPosteriors = rawEvaluations.map(r => r.hypothesis.priorConfidence * r.likelihood);
  const totalPosteriorSum = unnormalizedPosteriors.reduce((a, b) => a + b, 0) + unmodeledMass;

  const evaluations: HypothesisObservationEvaluation[] = rawEvaluations.map((r, i) => {
    let posterior = totalPosteriorSum > 0 ? unnormalizedPosteriors[i] / totalPosteriorSum : r.hypothesis.priorConfidence;

    // Strict Bayesian evidence consistency:
    if (r.verdict === 'SUPPORTED') {
      // Supported evidence increases confidence logically
      posterior = Math.max(r.hypothesis.priorConfidence * 1.05, posterior);
    } else if (r.verdict === 'CONTRADICTED') {
      // Contradicted evidence decreases confidence logically
      posterior = Math.min(r.hypothesis.priorConfidence * 0.70, posterior);
    } else if (r.isExactParameterMatch) {
      // Exact predicted=observed cases increase or preserve confidence rather than decrease it
      posterior = Math.max(r.hypothesis.priorConfidence, posterior);
    } else if (r.isInsideWindow) {
      // Parameter inside acceptable window: confidence must not decrease due to parameter disagreement
      posterior = Math.max(r.hypothesis.priorConfidence * 0.90, posterior);
    }

    // Bounded strictly between 0.02 and 0.98 (2% - 98%)
    const updatedConfidence = Number(Math.min(0.98, Math.max(0.02, posterior)).toFixed(4));

    let note = '';
    const errSummary = `Parameter residual: ${r.diffX.toFixed(5)} (norm e_x: ${r.e_x.toFixed(2)}), Metric residual: ${r.diffMetric.toFixed(2)} (norm e_y: ${r.e_y.toFixed(2)}), Composite error: ${r.normalizedError.toFixed(2)}`;
    
    if (r.verdict === 'SUPPORTED') {
      note = `Strong empirical concordance: observed optimum (${observedX}) matches prediction (${r.hypothesis.predictedOptimalParameter}) within acceptable window [${r.windowMin}, ${r.windowMax}] (${r.hypothesis.predictedOptimalParameter} ± ${r.sigmaX}). ${errSummary}.`;
    } else if (r.verdict === 'PARTIALLY_SUPPORTED') {
      note = r.isInsideWindow
        ? `Partial alignment: observed parameter (${observedX}) is within acceptable window [${r.windowMin}, ${r.windowMax}] but metric shows residual discrepancy. ${errSummary}.`
        : `Partial alignment: observed optimum (${observedX}) is near predicted window boundary [${r.windowMin}, ${r.windowMax}] (${r.hypothesis.predictedOptimalParameter} ± ${r.sigmaX}). ${errSummary}.`;
    } else {
      note = `Falsification criterion triggered: observed parameter (${observedX}) falls outside predicted window [${r.windowMin}, ${r.windowMax}] (${r.hypothesis.predictedOptimalParameter} ± ${r.sigmaX}). ${errSummary}.`;
    }

    return {
      hypothesisId: r.hypothesis.id,
      predictedParameter: r.hypothesis.predictedOptimalParameter,
      predictedMetric: r.hypothesis.predictedMetricValue,
      observedParameterDiff: r.diffX,
      observedMetricDiff: r.diffMetric,
      parameterNormalizedError: r.e_x,
      metricNormalizedError: r.e_y,
      normalizedError: r.normalizedError,
      priorConfidence: r.hypothesis.priorConfidence,
      updatedConfidence,
      verdict: r.verdict,
      evaluationNotes: note
    };
  });

  // 3. Synthesize findings
  const supported = evaluations.filter(e => e.verdict === 'SUPPORTED');
  const partiallySupported = evaluations.filter(e => e.verdict === 'PARTIALLY_SUPPORTED');
  const contradicted = evaluations.filter(e => e.verdict === 'CONTRADICTED');

  let synthesis = `Experiment ${experimentId} computed ${result.totalPointsComputed} points across parameter range. ` +
    `Global optimum observed at parameter = ${observedX} with peak metric = ${observedMetric}. `;

  if (supported.length > 0) {
    synthesis += `Hypothesis ${supported[0].hypothesisId} confirmed as strongest predictor (confidence updated: ${(supported[0].priorConfidence * 100).toFixed(0)}% -> ${(supported[0].updatedConfidence * 100).toFixed(0)}%). `;
  } else if (partiallySupported.length > 0) {
    synthesis += `Hypothesis ${partiallySupported[0].hypothesisId} demonstrated partial empirical alignment. `;
  }
  if (contradicted.length > 0) {
    synthesis += `Hypotheses [${contradicted.map(c => c.hypothesisId).join(', ')}] contradicted by empirical curve.`;
  }

  return {
    experimentId,
    timestamp,
    observedOptimumParameter: observedX,
    observedOptimumMetric: observedMetric,
    hypothesisEvaluations: evaluations,
    synthesis
  };
}
