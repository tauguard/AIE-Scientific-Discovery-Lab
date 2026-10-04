/**
 * Unit Tests for Deterministic Computational Experiment Engine
 * 
 * Verifies:
 * 1. Deterministic execution
 * 2. Identical inputs producing identical results
 * 3. Valid ComputationalResult structure
 * 4. Parameter sweep correctness
 * 5. Experiment failure handling
 */

import { runComputationalExperiment } from './computationalExperimentEngine';
import { ExperimentPlan } from '../types/discovery';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

function runTests(): void {
  console.log('🧪 Starting Computational Experiment Engine Test Suite...\n');
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

  // --- Test 1: Valid ComputationalResult Structure ---
  test('Valid ComputationalResult structure returned for standard plan', () => {
    const plan: ExperimentPlan = {
      id: 'EXP-TEST-01',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-01', 'HYP-02'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Carrier Doping Sweep for High-Tc Optimization',
      description: 'Numerical parameter sweep over doping x in [0.05, 0.35]',
      primaryParameter: {
        name: 'Doping Concentration',
        symbol: 'x',
        min: 0.05,
        max: 0.35,
        step: 0.01,
        unit: 'ratio',
        description: 'Lattice carrier doping level'
      },
      fixedParameters: {
        omega_0: 380.0,
        lambda_base: 0.45,
        lambda_peak_amp: 1.85,
        x_resonance_center: 0.215,
        resonance_width: 0.045,
        mu_star_base: 0.11
      },
      numericalSteps: 30
    };

    const res = runComputationalExperiment(plan);

    assert(res.success === true, 'Experiment execution should be successful');
    assert(res.experimentId === 'EXP-TEST-01', 'ExperimentId must match plan');
    assert(typeof res.timestamp === 'string', 'Timestamp must be string');
    assert(res.benchmarkModel === 'mcmillan_superconductor', 'BenchmarkModel must match plan');
    assert(typeof res.executionDurationMs === 'number', 'ExecutionDurationMs must be number');
    assert(Array.isArray(res.dataPoints), 'DataPoints must be an array');
    assert(res.dataPoints.length > 0, 'DataPoints must not be empty');
    assert(res.totalPointsComputed === res.dataPoints.length, 'TotalPointsComputed must match array length');
    assert(typeof res.optimalObservation === 'object', 'OptimalObservation must be object');
    assert(typeof res.optimalObservation.parameterValue === 'number', 'Optimal parameterValue must be number');
    assert(typeof res.optimalObservation.metricValue === 'number', 'Optimal metricValue must be number');
    assert(typeof res.summaryMetrics === 'object', 'SummaryMetrics must be object');
    assert(typeof res.reproducibilityHash === 'string', 'ReproducibilityHash must be string');
    assert(res.reproducibilityHash.startsWith('SIG-'), 'ReproducibilityHash must start with SIG-');
  });

  // --- Test 2: Deterministic Execution (Identical Inputs -> Identical Results) ---
  test('Identical inputs produce bit-for-bit identical results and hashes', () => {
    const planA: ExperimentPlan = {
      id: 'EXP-DETERMINISM',
      questionId: 'Q-DET',
      hypothesisIds: ['HYP-A'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Determinism Benchmark',
      description: 'Testing numerical reproducibility',
      primaryParameter: {
        name: 'Doping x',
        symbol: 'x',
        min: 0.10,
        max: 0.30,
        step: 0.02,
        unit: 'ratio',
        description: 'Doping parameter'
      },
      fixedParameters: {
        omega_0: 400.0,
        x_resonance_center: 0.22
      },
      numericalSteps: 10
    };

    // Deep clone to ensure independent object instances
    const planB: ExperimentPlan = JSON.parse(JSON.stringify(planA));

    const resA = runComputationalExperiment(planA);
    const resB = runComputationalExperiment(planB);

    assert(resA.success === true && resB.success === true, 'Both runs must succeed');
    assert(resA.totalPointsComputed === resB.totalPointsComputed, 'Total points computed must be equal');
    assert(resA.optimalObservation.parameterValue === resB.optimalObservation.parameterValue, 'Optimal parameter must be identical');
    assert(resA.optimalObservation.metricValue === resB.optimalObservation.metricValue, 'Optimal metric value must be identical');
    assert(resA.summaryMetrics.meanMetric === resB.summaryMetrics.meanMetric, 'Mean metric must be identical');
    assert(resA.summaryMetrics.maxMetric === resB.summaryMetrics.maxMetric, 'Max metric must be identical');
    assert(resA.summaryMetrics.minMetric === resB.summaryMetrics.minMetric, 'Min metric must be identical');
    assert(resA.summaryMetrics.stdDev === resB.summaryMetrics.stdDev, 'Standard deviation must be identical');
    assert(resA.reproducibilityHash === resB.reproducibilityHash, `Hashes must be identical: ${resA.reproducibilityHash} vs ${resB.reproducibilityHash}`);

    // Check all data points
    for (let i = 0; i < resA.dataPoints.length; i++) {
      const pA = resA.dataPoints[i];
      const pB = resB.dataPoints[i];
      assert(pA.parameterValue === pB.parameterValue, `Point ${i} parameterValue must match`);
      assert(pA.metricValue === pB.metricValue, `Point ${i} metricValue must match`);
    }
  });

  // --- Test 3: Parameter Sweep Correctness ---
  test('Parameter sweep correctly spans parameter range and identifies optimum', () => {
    const min = 0.10;
    const max = 0.30;
    const step = 0.05;

    const plan: ExperimentPlan = {
      id: 'EXP-SWEEP',
      questionId: 'Q-SWEEP',
      hypothesisIds: ['HYP-S'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Sweep Validation',
      description: 'Verifying range boundary and monotonic step increments',
      primaryParameter: {
        name: 'Doping x',
        symbol: 'x',
        min,
        max,
        step,
        unit: 'ratio',
        description: 'Doping'
      },
      fixedParameters: {
        x_resonance_center: 0.20
      },
      numericalSteps: 5
    };

    const res = runComputationalExperiment(plan);

    assert(res.dataPoints.length === 5, `Expected 5 points for range [0.10, 0.30] with step 0.05, got ${res.dataPoints.length}`);
    assert(res.dataPoints[0].parameterValue === 0.10, 'First point must match min');
    assert(res.dataPoints[res.dataPoints.length - 1].parameterValue === 0.30, 'Last point must match max');

    // Optimum should be near resonance center 0.20
    assert(res.optimalObservation.parameterValue === 0.20, `Optimum expected at x=0.20, got ${res.optimalObservation.parameterValue}`);
    assert(res.optimalObservation.metricValue > 0, 'Optimum Tc must be strictly positive');
  });

  // --- Test 4: Secondary Model Sweep (Michaelis-Menten) ---
  test('Secondary benchmark model (Michaelis-Menten) executes deterministically', () => {
    const plan: ExperimentPlan = {
      id: 'EXP-MM-01',
      questionId: 'Q-BIO',
      hypothesisIds: ['HYP-BIO'],
      benchmarkModel: 'michaelis_menten',
      title: 'Enzyme Kinetics Parameter Sweep',
      description: 'Substrate concentration sweep with inhibition',
      primaryParameter: {
        name: 'Substrate Concentration',
        symbol: '[S]',
        min: 0.0,
        max: 50.0,
        step: 5.0,
        unit: 'mM',
        description: 'Concentration'
      },
      fixedParameters: {
        V_max: 120.0,
        K_m: 6.0,
        K_i: 35.0
      },
      numericalSteps: 10
    };

    const res = runComputationalExperiment(plan);
    assert(res.success === true, 'Michaelis-Menten run must succeed');
    assert(res.dataPoints.length === 11, `Expected 11 points, got ${res.dataPoints.length}`);
    assert(res.optimalObservation.metricValue > 0, 'Velocity must be positive');
    assert(res.summaryMetrics.maxMetric > res.summaryMetrics.minMetric, 'Metrics must vary over range');
  });

  // --- Test 5: Experiment Failure Handling (Invalid Inputs) ---
  test('Experiment gracefully handles invalid parameter ranges without throwing', () => {
    // Min >= Max
    const invalidPlanA: ExperimentPlan = {
      id: 'EXP-ERR-01',
      questionId: 'Q-ERR',
      hypothesisIds: [],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Invalid Min/Max',
      description: 'Min is greater than Max',
      primaryParameter: {
        name: 'Invalid x',
        symbol: 'x',
        min: 0.50,
        max: 0.20,
        step: 0.01,
        unit: 'ratio',
        description: 'Invalid'
      },
      fixedParameters: {},
      numericalSteps: 10
    };

    const resA = runComputationalExperiment(invalidPlanA);
    assert(resA.success === false, 'Min >= Max must fail validation');
    assert(typeof resA.errorMessage === 'string' && resA.errorMessage.includes('strictly less than max'), 'Error message must explain min/max');
    assert(resA.totalPointsComputed === 0, 'Failed experiment must produce 0 points');

    // Negative step
    const invalidPlanB: ExperimentPlan = {
      ...invalidPlanA,
      primaryParameter: {
        ...invalidPlanA.primaryParameter,
        min: 0.10,
        max: 0.30,
        step: -0.05
      }
    };

    const resB = runComputationalExperiment(invalidPlanB);
    assert(resB.success === false, 'Negative step must fail validation');
    assert(typeof resB.errorMessage === 'string' && resB.errorMessage.includes('positive number'), 'Error message must explain step');

    // Null plan handling
    const resNull = runComputationalExperiment(null as unknown as ExperimentPlan);
    assert(resNull.success === false, 'Null plan must fail gracefully');
  });

  console.log(`\n📊 Test Results: ${passed}/${total} passed (${((passed / total) * 100).toFixed(0)}% success rate)\n`);

  if (passed !== total) {
    throw new Error(`Only ${passed}/${total} tests passed!`);
  }
}

runTests();
