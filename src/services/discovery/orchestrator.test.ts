/**
 * Orchestrator Multi-Iteration Hypothesis Integrity Test Suite
 * 
 * Verifies:
 * 1. Hypothesis ID preservation: Existing hypothesis IDs (HYP-01, HYP-02, HYP-03)
 *    are strictly preserved across iterations without generating new sets from scratch.
 * 2. Posterior-as-Prior Chaining: Round 2 prior confidences inherit Round 1 posterior
 *    confidences, ensuring Bayesian updates compound continuously across observations.
 * 3. Continuity verification: Detection and rejection of hypothesis ID mutations or omissions.
 * 4. End-to-end multi-round orchestration with candidate plan carry-forward.
 */

import {
  runFullDiscoveryIteration,
  verifyHypothesisContinuity,
  carryForwardHypotheses,
  decideNextExperiment
} from './orchestrator';
import {
  ScientificQuestion,
  ScientificHypothesis,
  ExperimentPlan,
  ComputationalResult,
  ObservationUpdate
} from '../../types/discovery';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

async function runOrchestratorTests(): Promise<void> {
  console.log('🧪 Starting Orchestrator Multi-Iteration Integrity Test Suite...\n');
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
    id: 'Q-TEST-SUPERCONDUCTOR',
    timestamp: new Date().toISOString(),
    domain: 'materials_science',
    title: 'Superconductor Tc Optimization',
    rawInquiry: 'How does carrier doping concentration x optimize Tc in strong-coupling superconductors?',
    targetObjective: 'Maximize critical transition temperature Tc',
    primaryVariable: 'x',
    targetMetric: 'Tc'
  };

  // --- Test 1: verifyHypothesisContinuity validation ---
  await test('verifyHypothesisContinuity strictly validates hypothesis ID preservation', () => {
    const prev: ScientificHypothesis[] = [
      { id: 'HYP-01', questionId: 'Q', title: 'H1', statement: 'S1', mechanism: 'M1', predictedOptimalParameter: 0.16, predictedMetricValue: 55, tolerance: 0.04, assumptions: [], testabilityScore: 0.9, epistemicLevel: 'MODEL-DEPENDENT', formalCausalRelation: 'do(x)->Tc', priorConfidence: 0.3, falsificationCriteria: 'F1', status: 'PENDING' },
      { id: 'HYP-02', questionId: 'Q', title: 'H2', statement: 'S2', mechanism: 'M2', predictedOptimalParameter: 0.215, predictedMetricValue: 64, tolerance: 0.035, assumptions: [], testabilityScore: 0.9, epistemicLevel: 'MODEL-DEPENDENT', formalCausalRelation: 'do(x)->Tc', priorConfidence: 0.5, falsificationCriteria: 'F2', status: 'PENDING' }
    ];

    const matching: ScientificHypothesis[] = [
      { ...prev[0], posteriorConfidence: 0.2 },
      { ...prev[1], posteriorConfidence: 0.7 }
    ];

    // Should pass cleanly
    assert(verifyHypothesisContinuity(prev, matching) === true, 'Matching hypothesis IDs must pass verification');

    // Mutated ID: HYP-02 replaced with HYP-99
    const mutated: ScientificHypothesis[] = [
      { ...prev[0] },
      { ...prev[1], id: 'HYP-99' }
    ];
    let threwMutated = false;
    try {
      verifyHypothesisContinuity(prev, mutated);
    } catch {
      threwMutated = true;
    }
    assert(threwMutated, 'Mutated hypothesis ID must be rejected');

    // Missing ID / count mismatch
    let threwCount = false;
    try {
      verifyHypothesisContinuity(prev, [matching[0]]);
    } catch {
      threwCount = true;
    }
    assert(threwCount, 'Omitted hypothesis must be rejected');
  });

  // --- Test 2: carryForwardHypotheses applies posteriors as new priors ---
  await test('carryForwardHypotheses carries posterior confidence forward as prior confidence', () => {
    const prev: ScientificHypothesis[] = [
      { id: 'HYP-01', questionId: 'Q', title: 'H1', statement: 'S1', mechanism: 'M1', predictedOptimalParameter: 0.16, predictedMetricValue: 55, tolerance: 0.04, assumptions: [], testabilityScore: 0.9, epistemicLevel: 'MODEL-DEPENDENT', formalCausalRelation: 'do(x)->Tc', priorConfidence: 0.35, posteriorConfidence: 0.19, falsificationCriteria: 'F1', status: 'CONTRADICTED' },
      { id: 'HYP-02', questionId: 'Q', title: 'H2', statement: 'S2', mechanism: 'M2', predictedOptimalParameter: 0.215, predictedMetricValue: 64, tolerance: 0.035, assumptions: [], testabilityScore: 0.9, epistemicLevel: 'MODEL-DEPENDENT', formalCausalRelation: 'do(x)->Tc', priorConfidence: 0.40, posteriorConfidence: 0.58, falsificationCriteria: 'F2', status: 'SUPPORTED' },
      { id: 'HYP-03', questionId: 'Q', title: 'H3', statement: 'S3', mechanism: 'M3', predictedOptimalParameter: 0.28, predictedMetricValue: 48, tolerance: 0.04, assumptions: [], testabilityScore: 0.9, epistemicLevel: 'MODEL-DEPENDENT', formalCausalRelation: 'do(x)->Tc', priorConfidence: 0.25, posteriorConfidence: 0.09, falsificationCriteria: 'F3', status: 'CONTRADICTED' }
    ];

    const carried = carryForwardHypotheses(prev);

    assert(carried.length === 3, 'All 3 hypotheses must be carried forward');
    assert(carried[0].id === 'HYP-01', 'HYP-01 ID preserved');
    assert(carried[1].id === 'HYP-02', 'HYP-02 ID preserved');
    assert(carried[2].id === 'HYP-03', 'HYP-03 ID preserved');

    assert(carried[0].priorConfidence === 0.19, `HYP-01 prior must be 0.19, got ${carried[0].priorConfidence}`);
    assert(carried[1].priorConfidence === 0.58, `HYP-02 prior must be 0.58, got ${carried[1].priorConfidence}`);
    assert(carried[2].priorConfidence === 0.09, `HYP-03 prior must be 0.09, got ${carried[2].priorConfidence}`);
  });

  // --- Test 3: Multi-Round Orchestration End-to-End ---
  await test('runFullDiscoveryIteration preserves hypothesis IDs and compounds posteriors in Round 2', async () => {
    // Round 1
    const iter1 = await runFullDiscoveryIteration(sampleQuestion, undefined, 1);
    assert(iter1.iterationNumber === 1, 'Iteration number 1');
    assert(iter1.hypotheses.length === 3, 'Must have 3 initial hypotheses');
    const iter1Ids = iter1.hypotheses.map(h => h.id);
    assert(iter1Ids.includes('HYP-01') && iter1Ids.includes('HYP-02') && iter1Ids.includes('HYP-03'),
      `Expected standard hypothesis IDs, got ${iter1Ids.join(', ')}`);

    // Verify Round 1 posterior updates
    const h2_round1 = iter1.hypotheses.find(h => h.id === 'HYP-02')!;
    assert(h2_round1.posteriorConfidence !== undefined, 'HYP-02 must have posterior confidence');
    const h2_r1_post = h2_round1.posteriorConfidence;

    // Follow-up experiment from Round 1 decision
    assert(iter1.nextExperimentDecision !== undefined, 'Next experiment decision must exist');
    const followUpCandidates = iter1.nextExperimentDecision!.candidateExperiments;
    assert(followUpCandidates.length > 0, 'Candidate experiments must be proposed');

    // Round 2: Pass previous hypotheses and candidate experiments
    const iter2 = await runFullDiscoveryIteration(
      sampleQuestion,
      undefined,
      2,
      {
        previousHypotheses: iter1.hypotheses,
        previousIteration: iter1,
        candidatePlans: followUpCandidates
      }
    );

    assert(iter2.iterationNumber === 2, 'Iteration number 2');

    // VERIFY HYPOTHESIS IDS ARE PRESERVED
    const iter2Ids = iter2.hypotheses.map(h => h.id);
    assert(JSON.stringify(iter2Ids) === JSON.stringify(iter1Ids),
      `Hypothesis IDs must be identical across rounds! (Round 1: [${iter1Ids.join(', ')}], Round 2: [${iter2Ids.join(', ')}])`);

    // VERIFY POSTERIOR OF ROUND 1 WAS USED AS PRIOR FOR ROUND 2
    const h2_round2 = iter2.hypotheses.find(h => h.id === 'HYP-02')!;
    assert(h2_round2.priorConfidence === h2_r1_post,
      `Round 2 prior confidence (${h2_round2.priorConfidence}) must equal Round 1 posterior confidence (${h2_r1_post})`);

    // VERIFY POSTERIOR UPDATE WAS APPLIED TO PREVIOUS ITERATION'S CONFIDENCE LEVEL
    // HYP-02 is supported by the peak at 0.215, so its confidence in Round 2 should increase from Round 1 posterior
    assert(h2_round2.posteriorConfidence! >= h2_round2.priorConfidence,
      `Round 2 posterior (${h2_round2.posteriorConfidence}) must be >= Round 2 prior (${h2_round2.priorConfidence}) for supported hypothesis`);

    // VERIFY ROUND 2 SELECTED THE FOLLOW-UP PLAN
    assert(iter2.experimentPlan.id === followUpCandidates[0].id,
      `Selected experiment plan must be the follow-up precision plan (${followUpCandidates[0].id}), got ${iter2.experimentPlan.id}`);

    // VERIFY SIGNATURES DIFFER
    assert(iter1.computationalResult.reproducibilityHash !== iter2.computationalResult.reproducibilityHash,
      `Round 1 hash (${iter1.computationalResult.reproducibilityHash}) and Round 2 hash (${iter2.computationalResult.reproducibilityHash}) must differ`);
  });

  console.log(`\n📊 Orchestrator Test Results: ${passed}/${total} passed (${((passed / total) * 100).toFixed(0)}% success rate)\n`);

  if (passed !== total) {
    throw new Error(`Only ${passed}/${total} tests passed!`);
  }
}

runOrchestratorTests().catch(err => {
  console.error('Fatal Orchestrator test error:', err);
  process.exit(1);
});
