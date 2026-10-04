/**
 * Agentic Scientific Discovery Types (AIE v1.0 Extension)
 * Databricks Agentic Scientific Discovery Benchmark
 * 
 * Pipeline:
 * USER QUESTION
 *       ↓
 * RESEARCH AGENT
 *       ↓
 * HYPOTHESIS AGENT
 *       ↓
 * EXPERIMENT PLANNER
 *       ↓
 * DETERMINISTIC EXPERIMENT ENGINE
 *       ↓
 * RESULT ANALYZER
 *       ↓
 * NEXT EXPERIMENT SELECTOR
 */

import { EpistemicLevel } from './aie';

/**
 * Initial scientific inquiry entered by the researcher or suggested by an agent.
 */
export interface ScientificQuestion {
  id: string;
  timestamp: string;
  domain: 'materials_science' | 'quantum_physics' | 'biochemistry' | 'thermodynamics' | 'astrophysics' | 'general_science';
  title: string;
  rawInquiry: string;
  targetObjective: string; // e.g., "Maximize critical temperature Tc under structural stability constraints"
  primaryVariable: string; // e.g., "doping_concentration_x"
  targetMetric: string;   // e.g., "critical_temperature_Tc"
}

/**
 * Summary of baseline research, domain constants, and prior literature context.
 * Clearly separates knowns, unknowns, assumptions, evidence, and research gaps.
 */
export interface ResearchSummary {
  questionId: string;
  theoreticalFramework: string;
  governingEquations: string[];
  knownInformation: string[];
  unknownInformation: string[];
  assumptions: string[];
  evidence: string[];
  researchGaps: string[];
  openQuestions: string[];
  knownInvariants: {
    name: string;
    symbol: string;
    standardValue: number | string;
    unit: string;
  }[];
  epistemicStatus: 'MODEL-DEPENDENT' | 'UNVERIFIED' | 'VERIFIED';
  baselineObservations: string[];
  keyChallenges: string[];
}

/**
 * Testable, falsifiable scientific hypothesis with causal formulation and epistemic tagging.
 */
export interface ScientificHypothesis {
  id: string; // e.g., "HYP-01"
  questionId: string;
  statement: string; // Core scientific assertion
  title: string;
  mechanism: string; // Detailed causal mechanism (e.g., "Strong electron-phonon coupling resonance")
  predictedOptimalParameter: number; // e.g., 0.22
  predictedMetricValue: number;      // e.g., 92.5 K
  tolerance: number;                 // Acceptable error margin e.g., 5.0
  parameterTolerance?: number;        // Explicit parameter margin in variable units e.g., 0.035
  metricTolerance?: number;           // Explicit metric margin in target units e.g., 8.0
  acceptableWindow?: [number, number]; // Explicit [min, max] parameter window e.g., [0.18, 0.25]
  expectedTrend?: string;            // e.g. "parabolic dome with sharp peak at resonance"
  assumptions: string[];
  testabilityScore: number;          // 0.0 to 1.0
  epistemicLevel: EpistemicLevel;     // Depth 0-4 (FORMAL, SCM-DERIVED, MODEL-DEPENDENT, etc.)
  formalCausalRelation: string;      // Pearl notation e.g. "do(doping = x) -> lambda(x) -> Tc(x)"
  priorConfidence: number;           // Bayesian prior 0.0 to 1.0 (e.g., 0.50)
  posteriorConfidence?: number;        // Updated confidence after observation
  falsificationCriteria: string;     // Specific condition that refutes this hypothesis
  status: 'PENDING' | 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'CONTRADICTED' | 'INCONCLUSIVE';
}

/**
 * Discrete parameter definition for experimental sweeps.
 */
export interface ExperimentParameter {
  name: string;
  symbol: string;
  min: number;
  max: number;
  step: number;
  defaultValue?: number;
  unit: string;
  description: string;
}

/**
 * Formal, parameterized computational experiment specification.
 */
export interface ExperimentPlan {
  id: string; // e.g., "EXP-01"
  questionId: string;
  hypothesisIds: string[]; // Hypotheses being tested
  benchmarkModel: 'mcmillan_superconductor' | 'michaelis_menten' | 'harmonic_oscillator' | 'custom_parameter_sweep';
  title: string;
  description: string;
  objective?: string;
  variables?: string[];
  primaryParameter: ExperimentParameter;
  fixedParameters: Record<string, number>;
  numericalSteps: number;
  expectedOutcome?: string;
  informationGain?: number;          // 0.0 to 1.0
  hypothesisDiscrimination?: number; // 0.0 to 1.0
  feasibility?: number;              // 0.0 to 1.0
  cost?: number;                     // 0.0 to 1.0
  risk?: number;                     // 0.0 to 1.0
  utilityScore?: number;
  stoppingCriteria?: string;
}

/**
 * Deterministic experiment selection audit and ranking breakdown.
 */
export interface ExperimentSelectionResult {
  candidateExperiments: ExperimentPlan[];
  utilityScores: {
    experimentId: string;
    score: number;
    breakdown: {
      informationGain: number;
      hypothesisDiscrimination: number;
      feasibility: number;
      cost: number;
      risk: number;
    };
  }[];
  selectedExperiment: ExperimentPlan;
  selectionReason: string;
}

/**
 * Individual discrete numerical data point produced by the computational run.
 */
export interface SimulationDataPoint {
  index: number;
  parameterValue: number; // e.g., x = 0.15
  metricValue: number;    // e.g., Tc = 84.3 K
  secondaryMetrics: Record<string, number>; // e.g., { lambda: 1.45, muStar: 0.12, stabilityIndex: 0.92 }
  valid: boolean;
}

/**
 * Verifiable, reproducible result generated by the deterministic computational engine.
 */
export interface ComputationalResult {
  experimentId: string;
  timestamp: string;
  success: boolean;
  benchmarkModel: string;
  executionDurationMs: number;
  totalPointsComputed: number;
  dataPoints: SimulationDataPoint[];
  optimalObservation: {
    parameterValue: number;
    metricValue: number;
    pointIndex: number;
  };
  summaryMetrics: {
    meanMetric: number;
    minMetric: number;
    maxMetric: number;
    variance: number;
    stdDev: number;
    convergenceResidual: number;
  };
  reproducibilityHash: string; // Deterministic sha-like signature derived from inputs and output
  errorMessage?: string;
}

/**
 * Deterministic hypothesis evaluation structure following experimental observation.
 */
export interface HypothesisObservationEvaluation {
  hypothesisId: string;
  predictedParameter: number;
  predictedMetric: number;
  observedParameterDiff: number;
  observedMetricDiff: number;
  parameterNormalizedError?: number;
  metricNormalizedError?: number;
  normalizedError: number;
  priorConfidence: number;
  updatedConfidence: number;
  verdict: 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'CONTRADICTED' | 'INCONCLUSIVE';
  evaluationNotes: string;
}

/**
 * Empirical observation comparing computational result against competing hypotheses.
 */
export interface ObservationUpdate {
  experimentId: string;
  timestamp: string;
  observedOptimumParameter: number;
  observedOptimumMetric: number;
  hypothesisEvaluations: HypothesisObservationEvaluation[];
  synthesis: string;
}

/**
 * Next-experiment decision engine recommendation.
 */
export interface NextExperimentDecision {
  nextExperimentId: string;
  reason: string;
  remainingUncertainty: number; // 0.0 to 1.0
  recommendedParameterRange: {
    min: number;
    max: number;
    step: number;
  };
  candidateExperiments: ExperimentPlan[];
}

/**
 * Single complete cycle of the scientific discovery loop.
 */
export interface DiscoveryIteration {
  iterationNumber: number;
  question: ScientificQuestion;
  researchSummary: ResearchSummary;
  hypotheses: ScientificHypothesis[];
  experimentPlan: ExperimentPlan;
  selectionResult?: ExperimentSelectionResult;
  computationalResult: ComputationalResult;
  observationUpdate: ObservationUpdate;
  nextExperimentDecision?: NextExperimentDecision;
}

/**
 * Top-level session state containing multi-iteration discovery trajectory.
 */
export interface DiscoverySession {
  id: string;
  createdAt: string;
  updatedAt: string;
  question: ScientificQuestion;
  researchSummary?: ResearchSummary;
  hypotheses: ScientificHypothesis[];
  candidatePlans?: ExperimentPlan[];
  selectedPlan?: ExperimentPlan;
  computationalResult?: ComputationalResult;
  observationUpdate?: ObservationUpdate;
  nextExperimentDecision?: NextExperimentDecision;
  iterations: DiscoveryIteration[];
  currentIterationNumber: number;
  isComplete: boolean;
  status: 'INITIALIZED' | 'RESEARCHING' | 'HYPOTHESIZING' | 'PLANNING' | 'EXECUTING' | 'ANALYZING' | 'CYCLE_COMPLETE' | 'FAILED';
  errorMessage?: string;
}
