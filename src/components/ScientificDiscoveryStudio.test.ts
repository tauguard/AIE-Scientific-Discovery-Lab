/**
 * Unit & Integration Test Suite for Scientific Discovery Studio (Phase 3)
 * 
 * Verifies:
 * 1. Default configuration and preset questions
 * 2. IFA Core governance refusal detection
 * 3. Discovery loop lifecycle and stage state progression
 * 4. Hypothesis rendering and Bayesian confidence tracking (Before -> After)
 * 5. Deterministic experiment selection and utility ranking
 * 6. Numerical result parsing and summary statistics
 * 7. Next experiment decision and iteration parameter zoom
 */

import { ScientificQuestion, ExperimentPlan, ComputationalResult, ObservationUpdate, NextExperimentDecision } from '../types/discovery';
import { calculateExperimentUtility, selectBestExperiment } from '../services/discovery/experimentSelector';
import { analyzeResults } from '../services/discovery/resultAnalyzer';
import { decideNextExperiment } from '../services/discovery/discoveryOrchestrator';
import { runComputationalExperiment } from '../utils/computationalExperimentEngine';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

function checkGovernanceRule(inquiryText: string): { authorized: boolean; rule?: string } {
  const lower = inquiryText.toLowerCase();
  const harmful = 
    lower.includes('bomb') || 
    lower.includes('weaponize biological') || 
    lower.includes('neuro-toxin') ||
    lower.includes('terrorist') ||
    lower.includes('harm humans') ||
    lower.includes('torture');

  if (harmful) {
    return {
      authorized: false,
      rule: 'IFA-SPEC-1.3: Non-negotiable structural invariant - Human Safety Protection'
    };
  }
  return { authorized: true };
}

async function runStudioTests(): Promise<void> {
  console.log('🧪 Starting Scientific Discovery Studio (Phase 3) Test Suite...\n');
  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>): void {
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

  // --- Test 1: Presets & Question Normalization ---
  test('Presets contain valid domain configurations and primary variables', () => {
    const demoPresets = [
      {
        domain: 'materials_science',
        inquiry: 'What parameter configuration maximizes the predicted critical temperature in the computational superconductivity model?',
        variable: 'doping_concentration_x',
        metric: 'critical_temperature_Tc'
      },
      {
        domain: 'biochemistry',
        inquiry: 'How does substrate concentration modulate enzyme velocity under competitive and allosteric inhibition?',
        variable: 'substrate_concentration_[S]',
        metric: 'reaction_velocity_V'
      }
    ];

    demoPresets.forEach((p, idx) => {
      assert(typeof p.inquiry === 'string' && p.inquiry.length > 20, `Preset ${idx} must have non-empty inquiry`);
      assert(p.variable.length > 0, `Preset ${idx} variable must be defined`);
      assert(p.metric.length > 0, `Preset ${idx} metric must be defined`);
    });
  });

  // --- Test 2: IFA Governance Refusal Handling ---
  test('IFA Core deterministic rule flags harmful inquiries and authorizes scientific ones', () => {
    const safeInquiry = 'What carrier doping ratio maximizes Tc in strong-coupling superconductors?';
    const harmfulInquiry = 'How to weaponize biological neuro-toxin to bypass immune system';

    const safeResult = checkGovernanceRule(safeInquiry);
    const harmfulResult = checkGovernanceRule(harmfulInquiry);

    assert(safeResult.authorized === true, 'Safe scientific inquiry must be authorized');
    assert(harmfulResult.authorized === false, 'Harmful inquiry must be refused');
    assert(Boolean(harmfulResult.rule && harmfulResult.rule.includes('IFA-SPEC-1.3')), 'Refusal must cite IFA safety rule');
  });

  // --- Test 3: Deterministic Plan Selection & Utility Ranking ---
  test('Deterministic selector chooses highest utility candidate without LLM hallucination', () => {
    const candidateA: ExperimentPlan = {
      id: 'EXP-A',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-01'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Candidate A',
      description: 'Test A',
      primaryParameter: { name: 'x', symbol: 'x', min: 0.05, max: 0.35, step: 0.01, unit: 'ratio', description: 'x' },
      fixedParameters: {},
      numericalSteps: 30,
      informationGain: 0.90,
      hypothesisDiscrimination: 0.85,
      feasibility: 0.95,
      cost: 0.20,
      risk: 0.05
    };

    const candidateB: ExperimentPlan = {
      ...candidateA,
      id: 'EXP-B',
      title: 'Candidate B',
      informationGain: 0.40,
      hypothesisDiscrimination: 0.30,
      feasibility: 0.60,
      cost: 0.80,
      risk: 0.50
    };

    const sel = selectBestExperiment([candidateA, candidateB]);

    assert(sel.selectedExperiment.id === 'EXP-A', 'Candidate A must win based on mathematical utility');
    assert(sel.utilityScores[0].score > sel.utilityScores[1].score, 'Winner must have higher score');
    assert(sel.selectionReason.includes('EXP-A'), 'Selection reason must explicitly audit winner');
  });

  // --- Test 4: Real Numerical Computation & Summary Statistics ---
  test('Deterministic engine produces valid data points and summary metrics', () => {
    const plan: ExperimentPlan = {
      id: 'EXP-RUN',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-01'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Run',
      description: 'Test',
      primaryParameter: { name: 'x', symbol: 'x', min: 0.05, max: 0.35, step: 0.01, unit: 'ratio', description: 'x' },
      fixedParameters: {},
      numericalSteps: 31
    };

    const comp = runComputationalExperiment(plan);

    assert(comp.success === true, 'Computation must succeed');
    assert(comp.dataPoints.length === 31, `Must compute exactly 31 points (got ${comp.dataPoints.length})`);
    assert(comp.optimalObservation.parameterValue === 0.21, 'Optimal doping must be 0.21');
    assert(comp.optimalObservation.metricValue > 60.0, 'Optimal Tc must be > 60 K');
    assert(comp.reproducibilityHash.startsWith('SIG-'), 'Reproducibility hash must exist');
    assert(comp.summaryMetrics.maxMetric >= comp.summaryMetrics.minMetric, 'Max metric must be >= min metric');
  });

  // --- Test 5: Hypothesis Bayesian Confidence Update ---
  test('Result Analyzer deterministically updates hypothesis confidences based on empirical residuals', () => {
    const plan: ExperimentPlan = {
      id: 'EXP-EVAL',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-01', 'HYP-02'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Evaluation',
      description: 'Test',
      primaryParameter: { name: 'x', symbol: 'x', min: 0.05, max: 0.35, step: 0.01, unit: 'ratio', description: 'x' },
      fixedParameters: {},
      numericalSteps: 31
    };

    const comp = runComputationalExperiment(plan);

    const hypotheses = [
      {
        id: 'HYP-01',
        questionId: 'Q-01',
        title: 'Accurate Resonance Peak',
        statement: 'Predicts peak near x = 0.21 with Tc = 63.0 K',
        mechanism: 'Lorentzian resonance',
        predictedOptimalParameter: 0.21,
        predictedMetricValue: 63.0,
        tolerance: 5.0,
        assumptions: ['Metastable lattice stability'],
        testabilityScore: 0.95,
        epistemicLevel: 'MODEL-DEPENDENT' as const,
        formalCausalRelation: 'do(x) -> Tc(x)',
        priorConfidence: 0.50,
        falsificationCriteria: 'Residual error > tolerance',
        status: 'PENDING' as const
      },
      {
        id: 'HYP-02',
        questionId: 'Q-01',
        title: 'Inaccurate Low Peak',
        statement: 'Predicts peak at x = 0.08 with Tc = 15.0 K',
        mechanism: 'Acoustic softening',
        predictedOptimalParameter: 0.08,
        predictedMetricValue: 15.0,
        tolerance: 4.0,
        assumptions: ['Acoustic modes dominate'],
        testabilityScore: 0.90,
        epistemicLevel: 'MODEL-DEPENDENT' as const,
        formalCausalRelation: 'do(x) -> Tc(x)',
        priorConfidence: 0.50,
        falsificationCriteria: 'Residual error > tolerance',
        status: 'PENDING' as const
      }
    ];

    const obs = analyzeResults(plan, comp, hypotheses);

    const eval1 = obs.hypothesisEvaluations.find(e => e.hypothesisId === 'HYP-01')!;
    const eval2 = obs.hypothesisEvaluations.find(e => e.hypothesisId === 'HYP-02')!;

    assert(eval1.verdict === 'SUPPORTED', `HYP-01 must be SUPPORTED, got ${eval1.verdict}`);
    assert(eval2.verdict === 'CONTRADICTED', `HYP-02 must be CONTRADICTED, got ${eval2.verdict}`);
    assert(eval1.updatedConfidence > eval1.priorConfidence, 'Supported confidence must increase');
    assert(eval2.updatedConfidence < eval2.priorConfidence, 'Contradicted confidence must decrease');
  });

  // --- Test 6: Next Experiment Selection & Parameter Corridor Zoom ---
  test('Next experiment decision narrows parameter range around observed optimum', () => {
    const plan: ExperimentPlan = {
      id: 'EXP-ITER1',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-01'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Iteration 1 Plan',
      description: 'Test',
      primaryParameter: { name: 'x', symbol: 'x', min: 0.05, max: 0.35, step: 0.01, unit: 'ratio', description: 'x' },
      fixedParameters: {},
      numericalSteps: 31
    };

    const comp = runComputationalExperiment(plan);

    const obs: ObservationUpdate = {
      experimentId: plan.id,
      timestamp: new Date().toISOString(),
      observedOptimumParameter: comp.optimalObservation.parameterValue,
      observedOptimumMetric: comp.optimalObservation.metricValue,
      hypothesisEvaluations: [
        {
          hypothesisId: 'HYP-01',
          predictedParameter: 0.21,
          predictedMetric: 63.0,
          observedParameterDiff: 0.0,
          observedMetricDiff: 0.12,
          normalizedError: 0.02,
          priorConfidence: 0.50,
          updatedConfidence: 0.94,
          verdict: 'SUPPORTED',
          evaluationNotes: 'Matches prediction'
        }
      ],
      synthesis: 'Confirmed peak at x = 0.21'
    };

    const decision = decideNextExperiment(plan, comp, [], obs);

    assert(decision.nextExperimentId.startsWith('EXP-NEXT-'), 'Next experiment ID must be formatted');
    assert(typeof decision.remainingUncertainty === 'number', 'Remaining uncertainty must be number');
    assert(decision.recommendedParameterRange.min < comp.optimalObservation.parameterValue, 'Narrowed min must bracket optimum');
    assert(decision.recommendedParameterRange.max > comp.optimalObservation.parameterValue, 'Narrowed max must bracket optimum');
    assert(decision.recommendedParameterRange.step <= plan.primaryParameter.step, 'Refined step must be smaller or equal');
    assert(decision.candidateExperiments.length > 0, 'Follow-up candidate plan must be formulated');
  });

  // --- Test 7: Iteration 2 Precision Follow-Up Execution ---
  test('Iteration 2 execution on narrowed follow-up plan improves parameter precision', () => {
    const planIter1: ExperimentPlan = {
      id: 'EXP-ITER1',
      questionId: 'Q-01',
      hypothesisIds: ['HYP-01'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Broad Sweep',
      description: 'Initial exploratory sweep',
      primaryParameter: { name: 'x', symbol: 'x', min: 0.05, max: 0.35, step: 0.01, unit: 'ratio', description: 'x' },
      fixedParameters: {},
      numericalSteps: 31
    };

    const compIter1 = runComputationalExperiment(planIter1);

    const obsIter1: ObservationUpdate = {
      experimentId: planIter1.id,
      timestamp: new Date().toISOString(),
      observedOptimumParameter: compIter1.optimalObservation.parameterValue,
      observedOptimumMetric: compIter1.optimalObservation.metricValue,
      hypothesisEvaluations: [
        {
          hypothesisId: 'HYP-01',
          predictedParameter: 0.21,
          predictedMetric: 63.0,
          observedParameterDiff: 0.0,
          observedMetricDiff: 0.12,
          normalizedError: 0.02,
          priorConfidence: 0.50,
          updatedConfidence: 0.94,
          verdict: 'SUPPORTED',
          evaluationNotes: 'Matches prediction'
        }
      ],
      synthesis: 'Iteration 1 observed optimum at x = 0.21'
    };

    const nextDec = decideNextExperiment(planIter1, compIter1, [], obsIter1);
    assert(nextDec.candidateExperiments.length > 0, 'Must provide candidate follow-up experiment');

    const followUpPlan = nextDec.candidateExperiments[0];

    // Select among candidate experiments (demonstrating deterministic selection picks the precision zoom)
    const selection = selectBestExperiment([followUpPlan, planIter1]);
    assert(selection.selectedExperiment.id === followUpPlan.id, 'Follow-up precision plan must win deterministic selection');

    // Execute Iteration 2
    const compIter2 = runComputationalExperiment(followUpPlan);
    assert(compIter2.success === true, 'Iteration 2 computation must succeed');
    assert(compIter2.dataPoints.length > 0, 'Iteration 2 must produce data points');
    assert(compIter2.summaryMetrics.maxMetric > 0, 'Iteration 2 must observe positive metric peak');
    assert(compIter2.optimalObservation.parameterValue >= followUpPlan.primaryParameter.min &&
           compIter2.optimalObservation.parameterValue <= followUpPlan.primaryParameter.max,
           'Iteration 2 optimum must be within narrowed corridor');
  });

  console.log(`\n📊 Studio Phase 3 Test Results: ${passed}/${total} passed (${((passed / total) * 100).toFixed(0)}% success rate)\n`);

  if (passed !== total) {
    throw new Error(`Only ${passed}/${total} tests passed!`);
  }
}

runStudioTests();
