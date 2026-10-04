/**
 * Hypothesis Analysis & Confidence Update Regression Test Suite
 * 
 * Verifies all 6 explicit requirements from Section 4:
 * A. Exact parameter match (predicted = 0.215, observed = 0.215)
 *    -> MUST NOT be CONTRADICTED
 *    -> confidence must not decrease because of parameter disagreement.
 * B. Parameter inside acceptable window (predicted = 0.215, observed = 0.214, window = [0.18, 0.25])
 *    -> MUST NOT be parameter contradiction.
 * C. Parameter outside window (predicted = 0.215, observed = 0.28, window = [0.18, 0.25])
 *    -> MUST be classified as parameter contradiction (CONTRADICTED).
 * D. Exact parameter match with metric mismatch (predicted = observed, metric differs materially)
 *    -> verify parameter residual remains strictly zero and metric residual is handled independently.
 * E. Exact parameter and metric match (both predicted and observed values agree)
 *    -> evidence should support hypothesis and confidence should increase or remain appropriately high.
 * F. Floating-point equivalent (predicted = 0.215, observed = 0.2150000001)
 *    -> should not become a false contradiction because of floating-point precision.
 */

import { analyzeResults, resolveParameterTolerance, resolveMetricTolerance } from './resultAnalyzer';
import { ExperimentPlan, ComputationalResult, ScientificHypothesis } from '../../types/discovery';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

function runResultAnalyzerRegressionTests(): void {
  console.log('🧪 Starting Result Analyzer Regression Test Suite (Cases A - F)...\n');
  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void): void {
    total++;
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✕ ${name}`);
      console.error(`    ${err?.message || err}`);
    }
  }

  const mockPlan: ExperimentPlan = {
    id: 'EXP-REGRESSION',
    questionId: 'Q-01',
    hypothesisIds: ['HYP-01', 'HYP-02', 'HYP-03'],
    benchmarkModel: 'mcmillan_superconductor',
    title: 'Superconductor Parameter Optimization Sweep',
    description: 'Testing empirical observation against hypotheses',
    primaryParameter: { name: 'x', symbol: 'x', min: 0.05, max: 0.35, step: 0.01, unit: 'ratio', description: 'x' },
    fixedParameters: {},
    numericalSteps: 31
  };

  // Helper to create mock computational result
  function createMockResult(observedX: number, observedMetric: number): ComputationalResult {
    return {
      experimentId: 'EXP-REGRESSION',
      timestamp: new Date().toISOString(),
      success: true,
      benchmarkModel: 'mcmillan_superconductor',
      executionDurationMs: 10,
      totalPointsComputed: 31,
      dataPoints: [
        { index: 0, parameterValue: observedX, metricValue: observedMetric, secondaryMetrics: {}, valid: true }
      ],
      optimalObservation: {
        parameterValue: observedX,
        metricValue: observedMetric,
        pointIndex: 0
      },
      summaryMetrics: {
        meanMetric: observedMetric,
        minMetric: observedMetric,
        maxMetric: observedMetric,
        variance: 0,
        stdDev: 0,
        convergenceResidual: 0
      },
      reproducibilityHash: 'SIG-TEST-HASH'
    };
  }

  // --- Requirement 4A: Exact parameter match ---
  test('Case A: Exact parameter match (pred = 0.215, obs = 0.215) MUST NOT be CONTRADICTED', () => {
    const hypA: ScientificHypothesis = {
      id: 'HYP-02',
      questionId: 'Q-01',
      title: 'Optimal Resonant Coupling',
      statement: 'Predicts maximum at x = 0.215 within [0.18, 0.25]',
      mechanism: 'Van Hove singularity in density of states',
      predictedOptimalParameter: 0.215,
      predictedMetricValue: 64.5,
      parameterTolerance: 0.035,
      acceptableWindow: [0.18, 0.25],
      tolerance: 0.035,
      assumptions: [],
      testabilityScore: 0.95,
      epistemicLevel: 'MODEL-DEPENDENT',
      formalCausalRelation: 'do(x) -> Tc(x)',
      priorConfidence: 0.50,
      falsificationCriteria: 'Observed maximum outside [0.18, 0.25]',
      status: 'PENDING'
    };

    const res = createMockResult(0.215, 64.29);
    const observation = analyzeResults(mockPlan, res, [hypA]);
    const ev = observation.hypothesisEvaluations[0];

    assert(ev.verdict !== 'CONTRADICTED', `Exact match must NEVER be CONTRADICTED (got ${ev.verdict})`);
    assert(ev.verdict === 'SUPPORTED', `Exact match must be SUPPORTED (got ${ev.verdict})`);
    assert(ev.observedParameterDiff === 0, `Parameter diff must be 0 (got ${ev.observedParameterDiff})`);
    assert(ev.parameterNormalizedError === 0, `Parameter normalized error must be 0 (got ${ev.parameterNormalizedError})`);
    assert(ev.updatedConfidence >= ev.priorConfidence, 
      `Confidence must not decrease for exact match (prior: ${ev.priorConfidence}, updated: ${ev.updatedConfidence})`);
  });

  // --- Requirement 4B: Parameter inside acceptable window ---
  test('Case B: Parameter inside window (pred = 0.215, obs = 0.214, window = [0.18, 0.25]) is NOT contradiction', () => {
    const hypB: ScientificHypothesis = {
      id: 'HYP-02',
      questionId: 'Q-01',
      title: 'Optimal Resonant Coupling',
      statement: 'Predicts maximum at x = 0.215 within [0.18, 0.25]',
      mechanism: 'Resonance',
      predictedOptimalParameter: 0.215,
      predictedMetricValue: 64.0,
      parameterTolerance: 0.035,
      acceptableWindow: [0.18, 0.25],
      tolerance: 0.035,
      assumptions: [],
      testabilityScore: 0.95,
      epistemicLevel: 'MODEL-DEPENDENT',
      formalCausalRelation: 'do(x) -> Tc(x)',
      priorConfidence: 0.50,
      falsificationCriteria: 'Observed maximum outside [0.18, 0.25]',
      status: 'PENDING'
    };

    const res = createMockResult(0.214, 64.0); // 0.214 is well inside [0.18, 0.25]
    const observation = analyzeResults(mockPlan, res, [hypB]);
    const ev = observation.hypothesisEvaluations[0];

    assert(ev.verdict !== 'CONTRADICTED', `Observation inside window must NOT be contradiction (got ${ev.verdict})`);
    assert(ev.verdict === 'SUPPORTED', `Observation inside window should be SUPPORTED (got ${ev.verdict})`);
    assert(ev.parameterNormalizedError !== undefined && ev.parameterNormalizedError < 0.1, 
      `Normalized parameter error should be small (<0.1), got ${ev.parameterNormalizedError}`);
  });

  // --- Requirement 4C: Parameter outside window ---
  test('Case C: Parameter outside window (pred = 0.215, obs = 0.28, window = [0.18, 0.25]) MUST be CONTRADICTED', () => {
    const hypC: ScientificHypothesis = {
      id: 'HYP-02',
      questionId: 'Q-01',
      title: 'Optimal Resonant Coupling',
      statement: 'Predicts maximum at x = 0.215 within [0.18, 0.25]',
      mechanism: 'Resonance',
      predictedOptimalParameter: 0.215,
      predictedMetricValue: 64.0,
      parameterTolerance: 0.035,
      acceptableWindow: [0.18, 0.25], // 0.28 is outside [0.18, 0.25]
      tolerance: 0.035,
      assumptions: [],
      testabilityScore: 0.95,
      epistemicLevel: 'MODEL-DEPENDENT',
      formalCausalRelation: 'do(x) -> Tc(x)',
      priorConfidence: 0.50,
      falsificationCriteria: 'Observed maximum outside [0.18, 0.25]',
      status: 'PENDING'
    };

    const res = createMockResult(0.28, 50.0);
    const observation = analyzeResults(mockPlan, res, [hypC]);
    const ev = observation.hypothesisEvaluations[0];

    assert(ev.verdict === 'CONTRADICTED', `Observation outside window MUST be CONTRADICTED (got ${ev.verdict})`);
    assert(ev.parameterNormalizedError !== undefined && ev.parameterNormalizedError > 1.2, 
      `Parameter normalized error must exceed 1.2 (got ${ev.parameterNormalizedError})`);
    assert(ev.updatedConfidence < ev.priorConfidence, 
      `Confidence must decrease when contradicted (prior: ${ev.priorConfidence}, updated: ${ev.updatedConfidence})`);
  });

  // --- Requirement 4D: Exact parameter match with metric mismatch ---
  test('Case D: Exact parameter match with metric mismatch: diffX is strictly 0 and metric handled independently', () => {
    const hypD: ScientificHypothesis = {
      id: 'HYP-02',
      questionId: 'Q-01',
      title: 'Optimal Resonant Coupling',
      statement: 'Predicts maximum at x = 0.215',
      mechanism: 'Resonance',
      predictedOptimalParameter: 0.215, // Exact match
      predictedMetricValue: 95.0,       // Large theoretical metric mismatch (~30 K)
      parameterTolerance: 0.035,
      metricTolerance: 10.0,
      acceptableWindow: [0.18, 0.25],
      tolerance: 0.035,
      assumptions: [],
      testabilityScore: 0.95,
      epistemicLevel: 'MODEL-DEPENDENT',
      formalCausalRelation: 'do(x) -> Tc(x)',
      priorConfidence: 0.50,
      falsificationCriteria: 'Observed maximum outside [0.18, 0.25]',
      status: 'PENDING'
    };

    const res = createMockResult(0.215, 64.29); // Parameter diff is 0, metric diff is ~30.7 K
    const observation = analyzeResults(mockPlan, res, [hypD]);
    const ev = observation.hypothesisEvaluations[0];

    assert(ev.observedParameterDiff === 0, `Parameter residual must remain strictly zero, got ${ev.observedParameterDiff}`);
    assert(ev.parameterNormalizedError === 0, `Parameter normalized error e_x must be 0.00, got ${ev.parameterNormalizedError}`);
    assert(ev.metricNormalizedError !== undefined && ev.metricNormalizedError > 2.0, 
      `Metric normalized error e_y must reflect the independent metric residual (>2.0), got ${ev.metricNormalizedError}`);
    assert(ev.verdict !== 'CONTRADICTED', `Exact parameter match must NOT be forced to CONTRADICTED by metric discrepancy (got ${ev.verdict})`);
    assert(ev.updatedConfidence >= ev.priorConfidence, `Confidence must not decrease due to parameter agreement (got ${ev.updatedConfidence})`);
  });

  // --- Requirement 4E: Exact parameter and metric match ---
  test('Case E: Exact parameter and metric match: evidence supports hypothesis and confidence increases', () => {
    const hypE: ScientificHypothesis = {
      id: 'HYP-02',
      questionId: 'Q-01',
      title: 'Optimal Resonant Coupling',
      statement: 'Predicts maximum at x = 0.215 and Tc = 64.29 K',
      mechanism: 'Van Hove resonance',
      predictedOptimalParameter: 0.215, // Exact match
      predictedMetricValue: 64.29,       // Exact match
      parameterTolerance: 0.035,
      metricTolerance: 8.0,
      acceptableWindow: [0.18, 0.25],
      tolerance: 0.035,
      assumptions: [],
      testabilityScore: 0.98,
      epistemicLevel: 'MODEL-DEPENDENT',
      formalCausalRelation: 'do(x) -> Tc(x)',
      priorConfidence: 0.50,
      falsificationCriteria: 'Observed maximum outside [0.18, 0.25]',
      status: 'PENDING'
    };

    const res = createMockResult(0.215, 64.29);
    const observation = analyzeResults(mockPlan, res, [hypE]);
    const ev = observation.hypothesisEvaluations[0];

    assert(ev.verdict === 'SUPPORTED', `Exact parameter and metric match must be SUPPORTED (got ${ev.verdict})`);
    assert(ev.parameterNormalizedError === 0, `e_x must be 0, got ${ev.parameterNormalizedError}`);
    assert(ev.metricNormalizedError === 0, `e_y must be 0, got ${ev.metricNormalizedError}`);
    assert(ev.normalizedError === 0, `composite error must be 0, got ${ev.normalizedError}`);
    assert(ev.updatedConfidence > ev.priorConfidence, 
      `Confidence must increase significantly for exact match (prior: ${ev.priorConfidence}, updated: ${ev.updatedConfidence})`);
    assert(ev.updatedConfidence >= 0.70, `Updated confidence should be high (>=0.70), got ${ev.updatedConfidence}`);
  });

  // --- Requirement 4F: Floating-point equivalent ---
  test('Case F: Floating-point equivalent (pred = 0.215, obs = 0.2150000001) avoids false contradiction', () => {
    const hypF: ScientificHypothesis = {
      id: 'HYP-02',
      questionId: 'Q-01',
      title: 'Optimal Resonant Coupling',
      statement: 'Predicts maximum at x = 0.215',
      mechanism: 'Van Hove resonance',
      predictedOptimalParameter: 0.215,
      predictedMetricValue: 64.3,
      parameterTolerance: 0.035,
      acceptableWindow: [0.18, 0.25],
      tolerance: 0.035,
      assumptions: [],
      testabilityScore: 0.98,
      epistemicLevel: 'MODEL-DEPENDENT',
      formalCausalRelation: 'do(x) -> Tc(x)',
      priorConfidence: 0.50,
      falsificationCriteria: 'Observed maximum outside [0.18, 0.25]',
      status: 'PENDING'
    };

    // Numerical floating-point drift: 0.2150000001 vs 0.215
    const res = createMockResult(0.2150000001, 64.300000005);
    const observation = analyzeResults(mockPlan, res, [hypF]);
    const ev = observation.hypothesisEvaluations[0];

    assert(ev.verdict === 'SUPPORTED', `Floating-point equivalent must NOT become a false contradiction (got ${ev.verdict})`);
    assert(ev.parameterNormalizedError === 0, `e_x must treat floating-point equivalent as zero, got ${ev.parameterNormalizedError}`);
    assert(ev.observedParameterDiff === 0, `diffX must treat floating-point equivalent as zero, got ${ev.observedParameterDiff}`);
    assert(ev.updatedConfidence >= ev.priorConfidence, 'Confidence must increase or preserve for floating-point match');
  });

  console.log(`\n📊 Result Analyzer Regression Results: ${passed}/${total} passed (${((passed / total) * 100).toFixed(0)}% success rate)\n`);

  if (passed !== total) {
    throw new Error(`Only ${passed}/${total} tests passed!`);
  }
}

runResultAnalyzerRegressionTests();
