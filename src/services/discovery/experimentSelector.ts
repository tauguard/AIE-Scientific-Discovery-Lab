/**
 * Deterministic Experiment Selector (AIE v1.0 Discovery Extension)
 * 
 * Evaluates candidate experiment plans using a transparent mathematical utility function:
 * Utility = informationGain + hypothesisDiscrimination + feasibility - cost - risk
 * 
 * Guarantees:
 * - 100% deterministic (server computes utility scores directly, zero LLM declaration)
 * - Ranks and selects the optimal experiment with full audit breakdown
 */

import { ExperimentPlan, ExperimentSelectionResult } from '../../types/discovery';

/**
 * Calculates transparent deterministic utility score for an ExperimentPlan.
 * 
 * Formula:
 * Utility = (informationGain * 1.0) + (hypothesisDiscrimination * 1.0) + (feasibility * 0.8) - (cost * 0.5) - (risk * 0.7)
 */
export function calculateExperimentUtility(plan: ExperimentPlan): {
  score: number;
  breakdown: {
    informationGain: number;
    hypothesisDiscrimination: number;
    feasibility: number;
    cost: number;
    risk: number;
  };
} {
  const info = plan.informationGain ?? 0.80;
  const disc = plan.hypothesisDiscrimination ?? 0.80;
  const feas = plan.feasibility ?? 0.90;
  const cost = plan.cost ?? 0.20;
  const risk = plan.risk ?? 0.10;

  // Weightings reflecting empirical priority in scientific discovery
  const utility = (info * 1.0) + (disc * 1.0) + (feas * 0.8) - (cost * 0.5) - (risk * 0.7);
  const normalizedScore = Number(utility.toFixed(4));

  return {
    score: normalizedScore,
    breakdown: {
      informationGain: Number(info.toFixed(4)),
      hypothesisDiscrimination: Number(disc.toFixed(4)),
      feasibility: Number(feas.toFixed(4)),
      cost: Number(cost.toFixed(4)),
      risk: Number(risk.toFixed(4))
    }
  };
}

/**
 * Deterministically ranks candidate experiments and selects the optimal plan.
 */
export function selectBestExperiment(candidates: ExperimentPlan[]): ExperimentSelectionResult {
  if (!candidates || candidates.length === 0) {
    throw new Error('Cannot select experiment from empty candidate list');
  }

  // Calculate utility scores for every candidate
  const scoredCandidates = candidates.map(plan => {
    const { score, breakdown } = calculateExperimentUtility(plan);
    const enrichedPlan: ExperimentPlan = {
      ...plan,
      utilityScore: score
    };
    return {
      plan: enrichedPlan,
      score,
      breakdown
    };
  });

  // Sort descending by utility score; tie-break deterministically by ID
  scoredCandidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.plan.id.localeCompare(b.plan.id);
  });

  const winner = scoredCandidates[0];
  const utilityScores = scoredCandidates.map(item => ({
    experimentId: item.plan.id,
    score: item.score,
    breakdown: item.breakdown
  }));

  const selectionReason = `Plan "${winner.plan.id}" (${winner.plan.title}) selected with highest deterministic utility score of ${winner.score}. ` +
    `Breakdown: Information Gain (${winner.breakdown.informationGain}) + Hypothesis Discrimination (${winner.breakdown.hypothesisDiscrimination}) ` +
    `+ Feasibility (${winner.breakdown.feasibility} * 0.8) - Cost (${winner.breakdown.cost} * 0.5) - Risk (${winner.breakdown.risk} * 0.7).`;

  return {
    candidateExperiments: scoredCandidates.map(s => s.plan),
    utilityScores,
    selectedExperiment: winner.plan,
    selectionReason
  };
}
