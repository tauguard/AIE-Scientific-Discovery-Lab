/**
 * Experiment Planner (AIE v1.0 Discovery Extension)
 * 
 * Translates competing scientific hypotheses into candidate parameterized ExperimentPlan
 * objects compatible with the deterministic computational experiment engine.
 * Proposes parameter bounds, step resolutions, fixed invariants, and utility metrics.
 */

import { 
  ScientificQuestion, 
  ScientificHypothesis, 
  ResearchSummary, 
  ExperimentPlan 
} from '../../types/discovery';
import { GeminiCaller } from './researchAgent';

const PLANNER_SYSTEM_PROMPT = `You are the Experiment Planner of the Scientific Discovery Engine in AIE v1.0.
Your task is to propose 3 candidate computational experiment plans to discriminate between competing hypotheses.

CRITICAL EXPERIMENT PLANNING RULES:
1. Every plan MUST be compatible with the deterministic computationalExperimentEngine:
   - benchmarkModel MUST be "mcmillan_superconductor" or "michaelis_menten".
   - primaryParameter MUST specify min, max, step (where min < max and step > 0).
   - numericalSteps MUST be between 10 and 50.
2. Formulate 3 distinct candidate plans targeting different experimental trade-offs:
   - Candidate A (Broad Exploratory Sweep): Spans the full range [0.05, 0.35] with moderate step 0.01 to establish overall trajectory.
   - Candidate B (Focused Resonance Zoom): Concentrates on the high-entropy window [0.18, 0.26] with high-resolution step 0.005 to discriminate HYP-01 from HYP-02.
   - Candidate C (Boundary Invariant Test): Evaluates boundary conditions [0.22, 0.34] to test HYP-03 against overdoped suppression.
3. Quantify utility attributes (all between 0.0 and 1.0):
   - informationGain: entropy reduction potential
   - hypothesisDiscrimination: ability to distinguish between competing hypotheses
   - feasibility: numerical tractability and physical stability
   - cost: computational overhead (proportional to steps)
   - risk: probability of unphysical divergence or numerical instability

Output valid JSON only matching:
{
  "candidatePlans": [
    {
      "id": "EXP-01",
      "title": "string name",
      "description": "string description",
      "objective": "string specific goal",
      "hypothesisIds": ["HYP-01", "HYP-02"],
      "benchmarkModel": "mcmillan_superconductor",
      "primaryParameter": {
        "name": "Doping Concentration",
        "symbol": "x",
        "min": 0.05,
        "max: 0.35,
        "step": 0.01,
        "unit": "ratio",
        "description": "Lattice carrier doping level"
      },
      "fixedParameters": {
        "omega_0": 380.0,
        "lambda_base": 0.45,
        "lambda_peak_amp": 1.85,
        "x_resonance_center": 0.215,
        "resonance_width": 0.045,
        "mu_star_base": 0.11
      },
      "numericalSteps": 30,
      "expectedOutcome": "string expectation",
      "informationGain": 0.85,
      "hypothesisDiscrimination": 0.80,
      "feasibility": 0.95,
      "cost": 0.20,
      "risk": 0.10
    }
  ]
}`;

export async function generateCandidateExperimentPlans(
  question: ScientificQuestion,
  hypotheses: ScientificHypothesis[],
  research: ResearchSummary,
  callGeminiFn?: GeminiCaller
): Promise<ExperimentPlan[]> {
  if (!question || !hypotheses || hypotheses.length === 0) {
    throw new Error('Valid ScientificQuestion and hypotheses required for experiment planning');
  }

  const hypothesisIds = hypotheses.map(h => h.id);

  if (callGeminiFn) {
    try {
      const prompt = `Formulate 3 candidate computational experiment plans to test these competing hypotheses:
Question: "${question.title}"
Primary Variable: ${question.primaryVariable}
Target Metric: ${question.targetMetric}

Hypotheses to discriminate:
${hypotheses.map(h => `${h.id}: ${h.title} (predicts ${question.primaryVariable} = ${h.predictedOptimalParameter} -> ${question.targetMetric} = ${h.predictedMetricValue})`).join('\n')}

Theoretical Framework: ${research.theoreticalFramework}`;

      const { text } = await callGeminiFn(PLANNER_SYSTEM_PROMPT, prompt);
      const parsed = JSON.parse(text || '{}');

      if (Array.isArray(parsed.candidatePlans) && parsed.candidatePlans.length >= 1) {
        return parsed.candidatePlans.slice(0, 3).map((p: any, idx: number) => {
          const param = p.primaryParameter || {};
          const min = Number(param.min ?? (0.05 + idx * 0.05));
          const max = Number(param.max ?? 0.35);
          const step = Number(param.step ?? 0.01);

          return {
            id: p.id || `EXP-0${idx + 1}`,
            questionId: question.id,
            hypothesisIds: Array.isArray(p.hypothesisIds) ? p.hypothesisIds : hypothesisIds,
            benchmarkModel: p.benchmarkModel === 'michaelis_menten' ? 'michaelis_menten' : 'mcmillan_superconductor',
            title: String(p.title || `Candidate Experiment ${idx + 1}`),
            description: String(p.description || 'Numerical parameter sweep'),
            objective: String(p.objective || `Determine empirical dependency of ${question.targetMetric} on ${question.primaryVariable}`),
            variables: [question.primaryVariable, question.targetMetric],
            primaryParameter: {
              name: String(param.name || 'Doping Concentration'),
              symbol: String(param.symbol || 'x'),
              min: min < max ? min : 0.05,
              max: max > min ? max : 0.35,
              step: step > 0 && step <= (max - min) ? step : 0.01,
              unit: String(param.unit || 'ratio'),
              description: String(param.description || 'Primary swept parameter')
            },
            fixedParameters: typeof p.fixedParameters === 'object' && p.fixedParameters !== null ? p.fixedParameters : {
              omega_0: 380.0,
              lambda_base: 0.45,
              lambda_peak_amp: 1.85,
              x_resonance_center: 0.215,
              resonance_width: 0.045,
              mu_star_base: 0.11
            },
            numericalSteps: Math.min(60, Math.max(5, Number(p.numericalSteps ?? 30))),
            expectedOutcome: String(p.expectedOutcome || 'Identify the global peak of transition temperature'),
            informationGain: Math.min(1.0, Math.max(0.1, Number(p.informationGain ?? 0.80))),
            hypothesisDiscrimination: Math.min(1.0, Math.max(0.1, Number(p.hypothesisDiscrimination ?? 0.85))),
            feasibility: Math.min(1.0, Math.max(0.1, Number(p.feasibility ?? 0.95))),
            cost: Math.min(1.0, Math.max(0.01, Number(p.cost ?? 0.15))),
            risk: Math.min(1.0, Math.max(0.01, Number(p.risk ?? 0.08)))
          };
        });
      }
    } catch (err: any) {
      console.warn('[ExperimentPlanner] Gemini call failed, utilizing rigorous domain fallback plans:', err?.message || err);
    }
  }

  // Deterministic Candidate Plans for Superconductor Doping Optimization
  return [
    {
      id: 'EXP-01-BROAD-SWEEP',
      questionId: question.id,
      hypothesisIds: ['HYP-01', 'HYP-02', 'HYP-03'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Full-Phase Exploratory Parameter Sweep',
      description: 'Global sweep across entire carrier doping range [0.05, 0.35] with step 0.01 to map global critical temperature topology.',
      objective: 'Simultaneously evaluate all three hypotheses across underdoped, optimal, and overdoped regimes.',
      variables: ['doping_x', 'Tc_Kelvin', 'electron_phonon_lambda', 'coulomb_mu_star'],
      primaryParameter: {
        name: 'Carrier Doping Concentration',
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
      numericalSteps: 31,
      expectedOutcome: 'Observe whether maximum Tc occurs at underdoped x=0.16, resonant x=0.215, or overdoped x=0.28.',
      informationGain: 0.92,
      hypothesisDiscrimination: 0.88,
      feasibility: 0.96,
      cost: 0.25,
      risk: 0.08
    },
    {
      id: 'EXP-02-RESONANCE-ZOOM',
      questionId: question.id,
      hypothesisIds: ['HYP-01', 'HYP-02'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'High-Resolution Resonance Window Zoom',
      description: 'Fine-grained parameter sweep over the critical intermediate corridor [0.16, 0.26] with step 0.005 to pinpoint exact peak position.',
      objective: 'Distinguish between HYP-01 (phonon peak at x=0.16) and HYP-02 (density-of-states singularity at x=0.215).',
      variables: ['doping_x', 'Tc_Kelvin', 'stability_index'],
      primaryParameter: {
        name: 'Resonant Carrier Doping',
        symbol: 'x',
        min: 0.16,
        max: 0.26,
        step: 0.005,
        unit: 'ratio',
        description: 'Intermediate high-density doping window'
      },
      fixedParameters: {
        omega_0: 380.0,
        lambda_base: 0.45,
        lambda_peak_amp: 1.85,
        x_resonance_center: 0.215,
        resonance_width: 0.045,
        mu_star_base: 0.11
      },
      numericalSteps: 21,
      expectedOutcome: 'High-precision determination of peak curvature and maximum Tc gradient.',
      informationGain: 0.88,
      hypothesisDiscrimination: 0.94,
      feasibility: 0.94,
      cost: 0.20,
      risk: 0.05
    },
    {
      id: 'EXP-03-OVERDOPED-BOUNDARY',
      questionId: question.id,
      hypothesisIds: ['HYP-02', 'HYP-03'],
      benchmarkModel: 'mcmillan_superconductor',
      title: 'Overdoped Coulomb Screening Boundary Test',
      description: 'Focused sweep across [0.22, 0.34] with step 0.01 to test whether carrier screening overcomes phonon degradation.',
      objective: 'Falsify or confirm HYP-03 prediction of an overdoped peak at x = 0.28.',
      variables: ['doping_x', 'Tc_Kelvin', 'coulomb_mu_star'],
      primaryParameter: {
        name: 'Overdoped Carrier Doping',
        symbol: 'x',
        min: 0.22,
        max: 0.34,
        step: 0.01,
        unit: 'ratio',
        description: 'Overdoped lattice window'
      },
      fixedParameters: {
        omega_0: 380.0,
        lambda_base: 0.45,
        lambda_peak_amp: 1.85,
        x_resonance_center: 0.215,
        resonance_width: 0.045,
        mu_star_base: 0.11
      },
      numericalSteps: 13,
      expectedOutcome: 'Ascertain whether Tc increases or drops monotonically past x = 0.22.',
      informationGain: 0.72,
      hypothesisDiscrimination: 0.78,
      feasibility: 0.95,
      cost: 0.15,
      risk: 0.07
    }
  ];
}
