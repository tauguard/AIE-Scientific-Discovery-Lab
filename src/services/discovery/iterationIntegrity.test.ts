/**
 * Iteration Integrity & True Iterative Discovery Regression Test Suite
 * 
 * Verifies:
 * 1. Signature Differentiation: Experiment A (broad) and Experiment B (narrowed zoom)
 *    produce strictly different reproducibility hashes and numerical data points.
 * 2. Dimensional Error Separation: If parameter residual is 0, parameter error e_x MUST be 0.00.
 *    Metric mismatch contributes cleanly without driving an exact parameter match to false contradiction.
 * 3. Follow-Up Plan Selection: Deterministic selector evaluates candidate plans and selects
 *    the precision zoom plan based on superior information gain and low cost for the follow-up inquiry.
 * 4. End-to-End Iterative Discovery Continuity:
 *    - Iteration 1 signature !== Iteration 2 signature
 *    - Iteration 2 parameter corridor [0.195, 0.235] is derived from Iteration 1 observation (0.215)
 *    - Hypothesis continuity: HYP-01, HYP-02, HYP-03 identities are preserved across rounds
 *    - Bayesian posterior chain: Iteration 2 updates from Iteration 1's posterior (P2 > P1 > P0).
 */

import { runComputationalExperiment } from '../../utils/computationalExperimentEngine';
import { analyzeResults } from './resultAnalyzer';
import { selectBestExperiment } from './experimentSelector';
import { decideNextExperiment } from './discoveryOrchestrator';
import { ExperimentPlan, ScientificHypothesis, ComputationalResult } from '../../types/discovery';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

function runIterationIntegrityTests(): void {
  console.log('🧪 Starting Iteration Integrity & Multi-Round Discovery Test Suite...\n');
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

  // --- PROBLEM 2: Signature Differentiation ---
  test('Different experiment inputs produce strictly different signatures and results', () => {
    const expA: ExperimentPlan = {
      id: 'EXP-02',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-01', 'HYP-02'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Exploratory Resonance Sweep',
      description: 'Iteration 1 broad sweep',
      primaryParameter: {
        name: 'Doping Concentration',
        symbol: 'x',
        min: 0.18,
        max: 0.26,
        step: 0.005,
        unit: 'ratio',
        description: 'Doping ratio'
      },
      fixedParameters: {},
      numericalSteps: 17
    };

    const expB: ExperimentPlan = {
      id: 'EXP-NEXT-7HDG',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-01', 'HYP-02'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Precision Follow-Up Zoom',
      description: 'Iteration 2 narrowed zoom',
      primaryParameter: {
        name: 'Refined Doping Concentration',
        symbol: 'x',
        min: 0.195,
        max: 0.235,
        step: 0.0025,
        unit: 'ratio',
        description: 'Narrowed doping corridor'
      },
      fixedParameters: {},
      numericalSteps: 17
    };

    const resA = runComputationalExperiment(expA);
    const resB = runComputationalExperiment(expB);

    assert(resA.success && resB.success, 'Both computations must succeed');
    assert(resA.reproducibilityHash !== resB.reproducibilityHash, 
      `Signatures MUST be different! (Got identical: ${resA.reproducibilityHash})`);
    assert(resA.dataPoints[0].parameterValue !== resB.dataPoints[0].parameterValue,
      'Starting parameter points must be different');
    assert(expA.primaryParameter.min !== expB.primaryParameter.min, 'Parameter min must be different');
    assert(expA.primaryParameter.step !== expB.primaryParameter.step, 'Parameter step must be different');
  });

  // --- PROBLEM 4: Dimensional Error Separation ---
  test('Exact parameter match + metric mismatch: e_x is strictly 0.00, not contradicted', () => {
    const plan: ExperimentPlan = {
      id: 'EXP-TEST',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-02'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Test',
      description: 'Test',
      primaryParameter: { name: 'x', symbol: 'x', min: 0.18, max: 0.26, step: 0.005, unit: 'ratio', description: 'x' },
      fixedParameters: {},
      numericalSteps: 17
    };

    const compResult: ComputationalResult = {
      experimentId: 'EXP-TEST',
      timestamp: new Date().toISOString(),
      success: true,
      benchmarkModel: 'mcmillan_superconductor',
      executionDurationMs: 5,
      totalPointsComputed: 17,
      dataPoints: [{ index: 0, parameterValue: 0.215, metricValue: 64.2924, secondaryMetrics: {}, valid: true }],
      optimalObservation: { parameterValue: 0.215, metricValue: 64.2924, pointIndex: 0 },
      summaryMetrics: { meanMetric: 64, minMetric: 64, maxMetric: 64.2924, variance: 0, stdDev: 0, convergenceResidual: 0 },
      reproducibilityHash: 'SIG-MOCK'
    };

    // Hypothesis with exact parameter match (0.215 = 0.215) but unrenormalized theoretical metric prediction (92.5 K vs 64.29 K)
    const hypMetricMismatch: ScientificHypothesis = {
      id: 'HYP-02',
      questionId: 'Q-01',
      title: 'Optimal Resonant Coupling',
      statement: 'Predicts x = 0.215',
      mechanism: 'Van Hove singularity',
      predictedOptimalParameter: 0.215, // Exact match
      predictedMetricValue: 92.5,       // Metric mismatch (~28 K higher)
      parameterTolerance: 0.035,
      metricTolerance: 15.0,
      acceptableWindow: [0.18, 0.25],
      tolerance: 0.035,
      assumptions: [],
      testabilityScore: 0.95,
      epistemicLevel: 'MODEL-DEPENDENT',
      formalCausalRelation: 'do(x) -> Tc(x)',
      priorConfidence: 0.50,
      falsificationCriteria: 'Peak outside [0.18, 0.25]',
      status: 'PENDING'
    };

    const obs = analyzeResults(plan, compResult, [hypMetricMismatch]);
    const ev = obs.hypothesisEvaluations[0];

    assert(ev.observedParameterDiff === 0, `Parameter diff must be 0, got ${ev.observedParameterDiff}`);
    assert(ev.parameterNormalizedError === 0, `e_x must be strictly 0, got ${ev.parameterNormalizedError}`);
    assert(ev.metricNormalizedError !== undefined && ev.metricNormalizedError > 1.0, 
      `Metric error e_y must reflect the metric difference, got ${ev.metricNormalizedError}`);
    assert(ev.normalizedError < 1.0, 
      `Composite error must remain well below 1.0 (got ${ev.normalizedError}) due to parameter location primacy`);
    assert(ev.verdict !== 'CONTRADICTED', `Exact parameter match must NEVER be CONTRADICTED, got: ${ev.verdict}`);
    assert(ev.verdict === 'SUPPORTED', `Expected SUPPORTED, got: ${ev.verdict}`);
  });

  test('Exact parameter match + metric match: e_x is 0.00, e_y is near 0.00, verdict is SUPPORTED', () => {
    const plan: ExperimentPlan = {
      id: 'EXP-TEST',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-02'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Test',
      description: 'Test',
      primaryParameter: { name: 'x', symbol: 'x', min: 0.18, max: 0.26, step: 0.005, unit: 'ratio', description: 'x' },
      fixedParameters: {},
      numericalSteps: 17
    };

    const compResult: ComputationalResult = {
      experimentId: 'EXP-TEST',
      timestamp: new Date().toISOString(),
      success: true,
      benchmarkModel: 'mcmillan_superconductor',
      executionDurationMs: 5,
      totalPointsComputed: 17,
      dataPoints: [{ index: 0, parameterValue: 0.215, metricValue: 64.2924, secondaryMetrics: {}, valid: true }],
      optimalObservation: { parameterValue: 0.215, metricValue: 64.2924, pointIndex: 0 },
      summaryMetrics: { meanMetric: 64, minMetric: 64, maxMetric: 64.2924, variance: 0, stdDev: 0, convergenceResidual: 0 },
      reproducibilityHash: 'SIG-MOCK'
    };

    const hypExact: ScientificHypothesis = {
      id: 'HYP-02',
      questionId: 'Q-01',
      title: 'Calibrated Hypothesis',
      statement: 'Predicts x = 0.215 and Tc = 64.5 K',
      mechanism: 'Van Hove singularity',
      predictedOptimalParameter: 0.215,
      predictedMetricValue: 64.5,
      parameterTolerance: 0.035,
      metricTolerance: 8.0,
      acceptableWindow: [0.18, 0.25],
      tolerance: 0.035,
      assumptions: [],
      testabilityScore: 0.95,
      epistemicLevel: 'MODEL-DEPENDENT',
      formalCausalRelation: 'do(x) -> Tc(x)',
      priorConfidence: 0.50,
      falsificationCriteria: 'Peak outside [0.18, 0.25]',
      status: 'PENDING'
    };

    const obs = analyzeResults(plan, compResult, [hypExact]);
    const ev = obs.hypothesisEvaluations[0];

    assert(ev.parameterNormalizedError === 0, `e_x must be 0, got ${ev.parameterNormalizedError}`);
    assert(ev.metricNormalizedError !== undefined && ev.metricNormalizedError < 0.1, 
      `e_y must be < 0.1, got ${ev.metricNormalizedError}`);
    assert(ev.normalizedError < 0.05, `Composite error must be < 0.05, got ${ev.normalizedError}`);
    assert(ev.verdict === 'SUPPORTED', `Verdict must be SUPPORTED, got ${ev.verdict}`);
  });

  test('Parameter outside window: e_x > 1.2, verdict is CONTRADICTED', () => {
    const plan: ExperimentPlan = {
      id: 'EXP-TEST',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-01'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Test',
      description: 'Test',
      primaryParameter: { name: 'x', symbol: 'x', min: 0.18, max: 0.26, step: 0.005, unit: 'ratio', description: 'x' },
      fixedParameters: {},
      numericalSteps: 17
    };

    const compResult: ComputationalResult = {
      experimentId: 'EXP-TEST',
      timestamp: new Date().toISOString(),
      success: true,
      benchmarkModel: 'mcmillan_superconductor',
      executionDurationMs: 5,
      totalPointsComputed: 17,
      dataPoints: [{ index: 0, parameterValue: 0.215, metricValue: 64.2924, secondaryMetrics: {}, valid: true }],
      optimalObservation: { parameterValue: 0.215, metricValue: 64.2924, pointIndex: 0 },
      summaryMetrics: { meanMetric: 64, minMetric: 64, maxMetric: 64.2924, variance: 0, stdDev: 0, convergenceResidual: 0 },
      reproducibilityHash: 'SIG-MOCK'
    };

    const hypOutside: ScientificHypothesis = {
      id: 'HYP-01',
      questionId: 'Q-01',
      title: 'Underdoped Hypothesis',
      statement: 'Predicts x = 0.160',
      mechanism: 'Acoustic mode softening',
      predictedOptimalParameter: 0.160,
      predictedMetricValue: 55.0,
      parameterTolerance: 0.040,
      acceptableWindow: [0.120, 0.200], // Observed is 0.215, outside window
      tolerance: 0.040,
      assumptions: [],
      testabilityScore: 0.95,
      epistemicLevel: 'MODEL-DEPENDENT',
      formalCausalRelation: 'do(x) -> Tc(x)',
      priorConfidence: 0.30,
      falsificationCriteria: 'Peak outside [0.12, 0.20]',
      status: 'PENDING'
    };

    const obs = analyzeResults(plan, compResult, [hypOutside]);
    const ev = obs.hypothesisEvaluations[0];

    assert(ev.parameterNormalizedError !== undefined && ev.parameterNormalizedError > 1.2, 
      `e_x must be > 1.2 for outside window, got ${ev.parameterNormalizedError}`);
    assert(ev.verdict === 'CONTRADICTED', `Verdict must be CONTRADICTED, got ${ev.verdict}`);
  });

  // --- PROBLEM 1 & 5: End-to-End Multi-Round Discovery Continuity ---
  test('Complete Iteration 1 -> Iteration 2 chain preserves hypotheses, executes zoom plan, and produces unique signatures', () => {
    // Round 1 Setup
    const initialHypotheses: ScientificHypothesis[] = [
      {
        id: 'HYP-01',
        questionId: 'Q-CHAIN',
        title: 'Underdoped Hypothesis',
        statement: 'Peaks at x = 0.16',
        mechanism: 'Phonon softening',
        predictedOptimalParameter: 0.160,
        predictedMetricValue: 55.0,
        parameterTolerance: 0.040,
        acceptableWindow: [0.120, 0.200],
        tolerance: 0.040,
        assumptions: [],
        testabilityScore: 0.94,
        epistemicLevel: 'MODEL-DEPENDENT',
        formalCausalRelation: 'do(x) -> Tc(x)',
        priorConfidence: 0.30,
        falsificationCriteria: 'Peak outside [0.12, 0.20]',
        status: 'PENDING'
      },
      {
        id: 'HYP-02',
        questionId: 'Q-CHAIN',
        title: 'Optimal Resonant Coupling',
        statement: 'Peaks at x = 0.215',
        mechanism: 'Lorentzian resonance',
        predictedOptimalParameter: 0.215,
        predictedMetricValue: 64.5,
        parameterTolerance: 0.035,
        acceptableWindow: [0.180, 0.250],
        tolerance: 0.035,
        assumptions: [],
        testabilityScore: 0.98,
        epistemicLevel: 'MODEL-DEPENDENT',
        formalCausalRelation: 'do(x) -> Tc(x)',
        priorConfidence: 0.50,
        falsificationCriteria: 'Peak outside [0.18, 0.25]',
        status: 'PENDING'
      },
      {
        id: 'HYP-03',
        questionId: 'Q-CHAIN',
        title: 'Overdoped Screening',
        statement: 'Peaks at x = 0.28',
        mechanism: 'Screening domination',
        predictedOptimalParameter: 0.280,
        predictedMetricValue: 48.0,
        parameterTolerance: 0.040,
        acceptableWindow: [0.240, 0.320],
        tolerance: 0.040,
        assumptions: [],
        testabilityScore: 0.91,
        epistemicLevel: 'MODEL-DEPENDENT',
        formalCausalRelation: 'do(x) -> Tc(x)',
        priorConfidence: 0.20,
        falsificationCriteria: 'Peak outside [0.24, 0.32]',
        status: 'PENDING'
      }
    ];

    // Iteration 1 Plan (Broad Exploratory Sweep)
    const planIter1: ExperimentPlan = {
      id: 'EXP-01-BROAD',
      questionId: 'Q-CHAIN',
      hypothesisIds: ['HYP-01', 'HYP-02', 'HYP-03'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Broad Phase Space Sweep',
      description: 'Mapping the global phase space',
      primaryParameter: {
        name: 'Doping',
        symbol: 'x',
        min: 0.05,
        max: 0.35,
        step: 0.01,
        unit: 'ratio',
        description: 'Doping'
      },
      fixedParameters: {},
      numericalSteps: 31,
      informationGain: 0.92,
      hypothesisDiscrimination: 0.88,
      feasibility: 0.96,
      cost: 0.25,
      risk: 0.08
    };

    // Execute Iteration 1
    const compIter1 = runComputationalExperiment(planIter1);
    const signature1 = compIter1.reproducibilityHash;
    const obsIter1 = analyzeResults(planIter1, compIter1, initialHypotheses);

    // Verify Iteration 1 Findings
    const evalIter1Hyp2 = obsIter1.hypothesisEvaluations.find(e => e.hypothesisId === 'HYP-02')!;
    const evalIter1Hyp1 = obsIter1.hypothesisEvaluations.find(e => e.hypothesisId === 'HYP-01')!;
    assert(evalIter1Hyp2.verdict === 'SUPPORTED', 'HYP-02 must be supported in Iteration 1');
    assert(evalIter1Hyp2.updatedConfidence > evalIter1Hyp2.priorConfidence, 'HYP-02 confidence must increase in Iteration 1');
    assert(evalIter1Hyp1.verdict === 'CONTRADICTED', 'HYP-01 must be contradicted in Iteration 1');
    assert(evalIter1Hyp1.updatedConfidence < evalIter1Hyp1.priorConfidence, 'HYP-01 confidence must decrease in Iteration 1');

    // Formulate Next Decision for Iteration 2
    const updatedHypothesesRound1: ScientificHypothesis[] = initialHypotheses.map(h => {
      const ev = obsIter1.hypothesisEvaluations.find(e => e.hypothesisId === h.id)!;
      return {
        ...h,
        posteriorConfidence: ev.updatedConfidence,
        status: ev.verdict
      };
    });

    const nextDecision = decideNextExperiment(planIter1, compIter1, updatedHypothesesRound1, obsIter1);

    // Verify Decision derives from Iteration 1 Observation
    assert(nextDecision.candidateExperiments.length >= 1, 'Must formulate follow-up candidate experiments');
    const followUpPlan = nextDecision.candidateExperiments[0];
    assert(followUpPlan.primaryParameter.min < compIter1.optimalObservation.parameterValue,
      'Narrowed corridor min must be below empirical optimum');
    assert(followUpPlan.primaryParameter.max > compIter1.optimalObservation.parameterValue,
      'Narrowed corridor max must be above empirical optimum');
    assert(followUpPlan.primaryParameter.step < planIter1.primaryParameter.step,
      'Refined step must be smaller than Iteration 1 step');

    // Deterministic selection among Iteration 2 candidates
    const selectionIter2 = selectBestExperiment(nextDecision.candidateExperiments);
    assert(selectionIter2.selectedExperiment.id === followUpPlan.id,
      `Deterministic selector must select the precision zoom plan (${followUpPlan.id}), got: ${selectionIter2.selectedExperiment.id}`);

    // Execute Iteration 2
    const compIter2 = runComputationalExperiment(selectionIter2.selectedExperiment);
    const signature2 = compIter2.reproducibilityHash;

    // --- CRITICAL INVARIANT: SIGNATURES MUST BE DIFFERENT ---
    assert(signature1 !== signature2, 
      `Iteration 1 signature (${signature1}) MUST NOT equal Iteration 2 signature (${signature2})!`);

    // --- HYPOTHESIS CONTINUITY: Carry forward posteriors as new priors ---
    const hypothesesIter2: ScientificHypothesis[] = updatedHypothesesRound1.map(h => ({
      ...h,
      priorConfidence: h.posteriorConfidence! // Posterior of round 1 becomes prior of round 2
    }));

    // Verify Hypothesis IDs preserve continuity
    assert(hypothesesIter2[0].id === 'HYP-01', 'HYP-01 must preserve identity');
    assert(hypothesesIter2[1].id === 'HYP-02', 'HYP-02 must preserve identity');
    assert(hypothesesIter2[2].id === 'HYP-03', 'HYP-03 must preserve identity');

    // Analyze Iteration 2 Results
    const obsIter2 = analyzeResults(selectionIter2.selectedExperiment, compIter2, hypothesesIter2);
    const evalIter2Hyp2 = obsIter2.hypothesisEvaluations.find(e => e.hypothesisId === 'HYP-02')!;

    // --- BAYESIAN CHAIN VERIFICATION: P2 > P1 > P0 ---
    const p0 = initialHypotheses[1].priorConfidence;   // 0.50
    const p1 = updatedHypothesesRound1[1].posteriorConfidence!; // ~0.70
    const p2 = evalIter2Hyp2.updatedConfidence;        // ~0.80+

    assert(p1 > p0, `Iteration 1 posterior (${p1}) must exceed initial prior (${p0})`);
    assert(p2 > p1, `Iteration 2 posterior (${p2}) must exceed Iteration 1 posterior (${p1})`);
  });

  console.log(`\n📊 Iteration Integrity Test Results: ${passed}/${total} passed (${((passed / total) * 100).toFixed(0)}% success rate)\n`);

  if (passed !== total) {
    throw new Error(`Only ${passed}/${total} tests passed!`);
  }
}

runIterationIntegrityTests();
