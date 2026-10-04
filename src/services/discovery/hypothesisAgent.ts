/**
 * Hypothesis Agent (AIE v1.0 Discovery Extension)
 * 
 * Formulates competing, falsifiable scientific hypotheses with causal Pearl mechanisms,
 * explicit quantitative predictions, prior confidence scores, and falsification criteria.
 * Hypotheses are treated as unverified candidates (MODEL-DEPENDENT), NOT scientific facts.
 */

import { ScientificQuestion, ResearchSummary, ScientificHypothesis } from '../../types/discovery';
import { GeminiCaller } from './researchAgent';

const HYPOTHESIS_SYSTEM_PROMPT = `You are the Hypothesis Agent of the Scientific Discovery Engine in AIE v1.0.
Your task is to generate exactly 3 distinct, competing, and falsifiable scientific hypotheses to answer a research inquiry.

CRITICAL METHODOLOGICAL RULES:
1. Every hypothesis MUST be structurally distinct:
   - Hypothesis 1: Conservative mechanism grounded in established baseline physics.
   - Hypothesis 2: Resonance / non-linear mechanism proposing an optimal parameter window.
   - Hypothesis 3: Competing / suppression mechanism positing counteracting boundary dynamics.
2. Every hypothesis MUST make explicit numerical predictions:
   - predictedOptimalParameter: number in variable units (e.g. 0.16, 0.215, 0.28)
   - parameterTolerance: number in same variable units (e.g. 0.035)
   - acceptableWindow: [min, max] parameter window (e.g. [0.18, 0.25])
   - predictedMetricValue: number (expected peak metric e.g. 55.0, 64.0, 48.0)
   - metricTolerance: number (expected metric tolerance e.g. 8.0)
3. Every hypothesis MUST include Pearl-style causal syntax in formalCausalRelation:
   e.g. "do(doping = x) -> lambda(x) -> Tc(x)"
4. State explicit falsificationCriteria (conditions that unambiguously refute the hypothesis).
5. Assign priorConfidence summing to approximately 1.0 across the 3 hypotheses.
6. Set epistemicLevel: "MODEL-DEPENDENT" (never claim empirical truth prior to experiment).

Output valid JSON only matching this schema:
{
  "hypotheses": [
    {
      "id": "HYP-01",
      "title": "string concise name",
      "statement": "string core assertion",
      "mechanism": "string causal pathway description",
      "predictedOptimalParameter": 0.16,
      "parameterTolerance": 0.045,
      "acceptableWindow": [0.115, 0.205],
      "predictedMetricValue": 55.0,
      "metricTolerance": 10.0,
      "tolerance": 0.045,
      "expectedTrend": "string description of metric trajectory",
      "assumptions": ["assumption 1", "assumption 2"],
      "testabilityScore": 0.95,
      "epistemicLevel": "MODEL-DEPENDENT",
      "formalCausalRelation": "do(x) -> lambda(x) -> Tc(x)",
      "priorConfidence": 0.35,
      "falsificationCriteria": "string explicit refute condition",
      "status": "PENDING"
    }
  ]
}`;

export async function generateHypotheses(
  question: ScientificQuestion,
  research: ResearchSummary,
  callGeminiFn?: GeminiCaller
): Promise<ScientificHypothesis[]> {
  if (!question || !research) {
    throw new Error('ScientificQuestion and ResearchSummary are required to generate hypotheses');
  }

  if (callGeminiFn) {
    try {
      const prompt = `Formulate 3 competing, falsifiable hypotheses for the following scientific inquiry:
Question: "${question.title}" (${question.rawInquiry})
Target Objective: ${question.targetObjective}
Primary Variable: ${question.primaryVariable}
Target Metric: ${question.targetMetric}

Theoretical Framework:
${research.theoreticalFramework}

Governing Equations:
${research.governingEquations.join('\n')}

Known Facts:
${research.knownInformation.join('; ')}

Research Gaps:
${research.researchGaps.join('; ')}

Standard Theoretical Regimes to Anchor Competing Hypotheses:
- Hypothesis 1 (Underdoped Phonon Softening): predictedOptimalParameter ~0.16, acceptableWindow [0.12, 0.20], parameterTolerance 0.040, predictedMetricValue ~55.0 K
- Hypothesis 2 (Optimal Resonant Coupling): predictedOptimalParameter ~0.215, acceptableWindow [0.18, 0.25], parameterTolerance 0.035, predictedMetricValue ~64.5 K
- Hypothesis 3 (Overdoped Screening Domination): predictedOptimalParameter ~0.28, acceptableWindow [0.24, 0.32], parameterTolerance 0.040, predictedMetricValue ~48.0 K`;

      const { text } = await callGeminiFn(HYPOTHESIS_SYSTEM_PROMPT, prompt);
      const parsed = JSON.parse(text || '{}');

      if (Array.isArray(parsed.hypotheses) && parsed.hypotheses.length >= 2) {
        return parsed.hypotheses.slice(0, 3).map((h: any, idx: number) => {
          const predX = Number(h.predictedOptimalParameter ?? (0.16 + idx * 0.05));
          let paramTol = h.parameterTolerance !== undefined ? Number(h.parameterTolerance) : Number(h.tolerance ?? 0.04);
          if (predX <= 1.0 && paramTol > 1.0) paramTol = paramTol / 100; // normalize percentage
          const windowMin = Array.isArray(h.acceptableWindow) && h.acceptableWindow.length === 2 ? Number(h.acceptableWindow[0]) : Number((predX - paramTol).toFixed(4));
          const windowMax = Array.isArray(h.acceptableWindow) && h.acceptableWindow.length === 2 ? Number(h.acceptableWindow[1]) : Number((predX + paramTol).toFixed(4));

          return {
            id: h.id || `HYP-0${idx + 1}`,
            questionId: question.id,
            title: String(h.title || `Hypothesis ${idx + 1}`),
            statement: String(h.statement || h.title),
            mechanism: String(h.mechanism || 'Proposed structural interaction mechanism'),
            predictedOptimalParameter: predX,
            predictedMetricValue: Number(h.predictedMetricValue ?? (60.0 + idx * 4)),
            tolerance: paramTol,
            parameterTolerance: paramTol,
            metricTolerance: Number(h.metricTolerance ?? 8.0),
            acceptableWindow: [windowMin, windowMax] as [number, number],
            expectedTrend: h.expectedTrend ? String(h.expectedTrend) : 'Monotonic increase toward resonance followed by saturation',
            assumptions: Array.isArray(h.assumptions) ? h.assumptions.map(String) : ['Model-dependent harmonic approximation'],
            testabilityScore: Math.min(1.0, Math.max(0.1, Number(h.testabilityScore ?? 0.90))),
            epistemicLevel: 'MODEL-DEPENDENT',
            formalCausalRelation: String(h.formalCausalRelation || `do(${question.primaryVariable}) -> intermediate_coupling -> ${question.targetMetric}`),
            priorConfidence: Math.min(1.0, Math.max(0.05, Number(h.priorConfidence ?? 0.33))),
            falsificationCriteria: String(h.falsificationCriteria || `Observed optimum falls outside acceptable window [${windowMin}, ${windowMax}]`),
            status: 'PENDING'
          };
        });
      }
    } catch (err: any) {
      console.warn('[HypothesisAgent] Gemini call failed, utilizing rigorous domain fallback:', err?.message || err);
    }
  }

  // Deterministic 3-Hypothesis Fallback for Superconducting McMillan Optimization
  return [
    {
      id: 'HYP-01',
      questionId: question.id,
      title: 'Underdoped Phonon Softening Hypothesis',
      statement: 'Superconducting transition temperature peaks in the underdoped regime (x ~ 0.16) due to softening of acoustic phonon branches.',
      mechanism: 'Lattice parameter expansion at low carrier density softens acoustic modes, maximizing the logarithmic frequency factor omega_log before Coulomb repulsion escalates.',
      predictedOptimalParameter: 0.16,
      predictedMetricValue: 55.0,
      tolerance: 0.045,
      parameterTolerance: 0.045,
      metricTolerance: 10.0,
      acceptableWindow: [0.115, 0.205],
      expectedTrend: 'Rapid onset with sharp peak at x = 0.16, followed by steep descent as Coulomb screening breaks down',
      assumptions: [
        'Acoustic phonon modes dominate electron-phonon pairing matrix elements',
        'Coulomb repulsion mu* is negligible below x = 0.18'
      ],
      testabilityScore: 0.94,
      epistemicLevel: 'MODEL-DEPENDENT',
      formalCausalRelation: 'do(doping = 0.16) -> max(omega_log) -> peak(Tc)',
      priorConfidence: 0.30,
      falsificationCriteria: 'Global maximum of Tc occurs outside x in [0.115, 0.205].',
      status: 'PENDING'
    },
    {
      id: 'HYP-02',
      questionId: question.id,
      title: 'Optimal Resonant Coupling Hypothesis',
      statement: 'Superconducting transition temperature achieves global maximum near optimal resonance (x ~ 0.215) where coupling parameter lambda peaks via density-of-states singularity.',
      mechanism: 'Van Hove singularity in electronic density of states aligns with Fermi energy at x = 0.215, generating a sharp Lorentzian resonance in lambda (~2.2) while maintaining thermodynamic stability S(x) > 0.85.',
      predictedOptimalParameter: 0.215,
      predictedMetricValue: 64.5,
      tolerance: 0.035,
      parameterTolerance: 0.035,
      metricTolerance: 8.0,
      acceptableWindow: [0.18, 0.25],
      expectedTrend: 'Parabolic dome with asymmetric peak centered precisely in the range x in [0.18, 0.25]',
      assumptions: [
        'Allen-Dynes strong-coupling correction factor f1 applies smoothly for lambda > 1.5',
        'Metastable structural integrity holds across the resonance window'
      ],
      testabilityScore: 0.98,
      epistemicLevel: 'MODEL-DEPENDENT',
      formalCausalRelation: 'do(doping = 0.215) -> peak(lambda = 2.2) -> max(Tc_AllenDynes)',
      priorConfidence: 0.50,
      falsificationCriteria: 'Global maximum of Tc occurs outside x in [0.18, 0.25].',
      status: 'PENDING'
    },
    {
      id: 'HYP-03',
      questionId: question.id,
      title: 'Overdoped Coulomb Screening Domination Hypothesis',
      statement: 'Critical temperature peaks in the overdoped regime (x ~ 0.28) where dense mobile carrier screening suppresses Coulomb repulsion mu* below 0.08.',
      mechanism: 'Excessive itinerant carriers screen out long-range Coulomb repulsion, allowing even moderate pairing interaction lambda (~1.2) to establish stable Cooper pairs without lattice distortion.',
      predictedOptimalParameter: 0.28,
      predictedMetricValue: 48.0,
      tolerance: 0.050,
      parameterTolerance: 0.050,
      metricTolerance: 10.0,
      acceptableWindow: [0.23, 0.33],
      expectedTrend: 'Plateau-like behavior with broad maximum around x = 0.28',
      assumptions: [
        'Thomas-Fermi dielectric screening scales monotonically with injected carrier density',
        'Polaronic localization is suppressed by high mobile carrier mobility'
      ],
      testabilityScore: 0.91,
      epistemicLevel: 'MODEL-DEPENDENT',
      formalCausalRelation: 'do(doping = 0.28) -> min(mu_star) -> max(Tc)',
      priorConfidence: 0.20,
      falsificationCriteria: 'Global maximum of Tc occurs outside x in [0.23, 0.33].',
      status: 'PENDING'
    }
  ];
}
