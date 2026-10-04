/**
 * Artificial Imagination Engine (AIE) v1.0 Normative Data Types
 * Reference: Normative Specification for Artificial Imagination Engine (AIE) v1.0 (2026-05-27)
 * Author: Michal Harcej
 */

export type EngineMode = 
  | 'overview'
  | 'discovery'
  | 'counterfactual'
  | 'blender'
  | 'dream'
  | 'constraints'
  | 'narrative'
  | 'synesthesia'
  | 'critic'
  | 'self-play'
  | 'ckg-audit'
  | 'compliance';

export type InvariantType = 
  | 'safety'
  | 'ethics'
  | 'legality'
  | 'resource_limits'
  | 'auditability';

export interface IFAInvariant {
  id: InvariantType;
  name: string;
  description: string;
  status: 'passed' | 'violated' | 'evaluating';
  ruleReference: string;
}

export interface GovernanceDecision {
  id: string;
  timestamp: string;
  proposedAction: string;
  module: string;
  authorized: boolean;
  violatedRule?: string;
  authority: 'IFA-Deterministic-Core-v1.0';
  outcome: 'AUTHORIZED' | 'REFUSED';
  explanation: string;
}

export type ConstraintType = 
  | 'gravity'
  | 'time'
  | 'scale'
  | 'identity'
  | 'logic'
  | 'biology';

export interface RelaxedConstraint {
  type: ConstraintType;
  name: string;
  description: string;
  active: boolean;
  relaxationDegree: number; // 0 (standard reality) to 100 (fully suspended)
  promptModifier: string;
  safetyLock: boolean; // Cannot violate physical harm invariants
}

// Causal Node in SCM (Structural Causal Model)
export interface CausalNode {
  id: string;
  label: string;
  domain: 'physics' | 'biology' | 'ecosystem' | 'society' | 'technology';
  isIntervention: boolean;
  value: string;
  description: string;
}

export interface CausalEdge {
  from: string;
  to: string;
  mechanism: string;
  strength: number; // 0 to 1
}

export interface SCMGraph {
  intervention: string; // do(X)
  nodes: CausalNode[];
  edges: CausalEdge[];
  downstreamCascade: string[];
}

export type EpistemicLevel = 
  | 'FORMAL'
  | 'SCM-DERIVED'
  | 'MODEL-DEPENDENT'
  | 'SPECULATIVE EXTRAPOLATION'
  | 'NARRATIVE SYNTHESIS';

export interface EpistemicSection {
  id: string;
  level: EpistemicLevel;
  depth: number; // 0 for FORMAL, 1 for SCM-DERIVED, 2 for MODEL-DEPENDENT, 3 for SPECULATIVE EXTRAPOLATION, 4 for NARRATIVE SYNTHESIS
  sourceDomain: string;
  text: string;
  rationale: string;
}

export interface EpistemicBoundary {
  formalIntervention: string; // What the SCM actually specifies (e.g., do(gravity = repulsive))
  scmDerived: string[]; // Rigorous structural derivation (e.g. Physics -> Atmosphere)
  modelDependent: string[]; // Dependent on specific domain transition models (e.g. Atmosphere -> Biology)
  speculativeExtrapolation: string[]; // Beyond the formal causal DAG (e.g. Biology -> Society -> Technology)
  narrativeSynthesis: string; // Fictional linguistic expression of resulting world state
}

export interface CausalCriticAudit {
  consistencyPassed: boolean;
  dependencyIntegrity: string;
  contradictionCheck: 'NO_CONTRADICTIONS' | 'PARACONSISTENT_TOLERATED' | 'FATAL_PARADOX';
  notes: string;
  rejectedClaims?: string[]; // Specifically audited & rejected unphysical/speculative assertions
  evaluatedConstants?: {
    constant: string;
    standardValue: string;
    counterfactualValue: string;
    status: 'CALCULATED' | 'MODEL-DEPENDENT' | 'UNDETERMINED';
    notes: string;
  }[];
}

export interface CounterfactualResult {
  query: string;
  intervention: string;
  causalModel: SCMGraph;
  propagationDepth: number; // Downstream transitions count
  epistemicBoundary: EpistemicBoundary;
  causalCritic: CausalCriticAudit;
  simulatedWorld: string;
  physicalManifestations: string[];
  societalImpacts: string[];
  visualPrompt: string;
}

export interface StructuralMapping {
  elementA: string;
  elementB: string;
  mappingType: 'function' | 'morphology' | 'dynamics' | 'material';
  emergentProperty: string;
}

export type EmergenceStatus = 'SUPPORTED' | 'BLEND-DERIVED' | 'MODEL-DEPENDENT' | 'REJECTED';

export interface EmergenceProvenance {
  emergentProperty: string;
  sourceMapping: string; // e.g. "locomotion + morphology"
  derivation: 'structural' | 'functional' | 'behavioral' | 'dynamic' | 'narrative invention';
  status: EmergenceStatus;
  auditRationale: string;
}

export interface BlendCriticAudit {
  validityPassed: boolean;
  structuralGroundedness: number; // 0.0 - 1.0 ratio
  formulaChecked: string; // e.g. "Emergence = f(A_structure, B_structure, Mapping) verified"
  supportedCount: number;
  rejectedCount: number;
  unsupportedAttributions: string[]; // specifically rejected arbitrary inventions
  notes: string;
}

export interface ConceptualBlendResult {
  conceptA: string;
  conceptB: string;
  domainA: string;
  domainB: string;
  featuresA?: string[];
  featuresB?: string[];
  structuralMappings: StructuralMapping[];
  emergenceProvenance: EmergenceProvenance[];
  blendCritic: BlendCriticAudit;
  blendedConceptName: string;
  blendedDescription: string;
  emergentProperties: string[]; // Filtered, surviving genuine emergent properties
  unintendedAnomalies: string[];
  visualMetaphor: string;
}

export interface DreamNode {
  step: number;
  concept: string;
  latentDistance: number;
  noveltyScore: number;
  coherenceScore: number;
  surpriseScore: number;
  overallReward: number; // Novelty * Coherence * Surprise
  isSurprisePeak: boolean;
  associationReason: string;
}

export interface DreamResult {
  seedConcept: string;
  trajectory: DreamNode[];
  totalSteps: number;
  peakSurpriseConcept: string;
  synthesizedNovelInsight: string;
  activationPath: string[];
}

export interface NarrativeStep {
  stage: 'setup' | 'rising_tension' | 'climax' | 'twist' | 'resolution';
  title: string;
  tensionLevel: number; // 0 to 100
  narrativeText: string;
  causalReasoning: string;
  epistemicLevel?: EpistemicLevel;
  generationDepth?: number;
  branchingOptions?: {
    choiceText: string;
    alternateConsequence: string;
  }[];
}

export interface NarrativeResult {
  prompt: string;
  arcTitle: string;
  summary: string;
  steps: NarrativeStep[];
  epistemicBoundary?: EpistemicBoundary;
}

export interface SynestheticAudioConfig {
  rootFrequency: number; // Hz
  timbre: 'sine' | 'triangle' | 'sawtooth' | 'square';
  chordHarmonics: number[]; // Frequencies in Hz
  tempoBpm: number;
  filterCutoff: number;
  spatialStereoPan: number; // -1 to 1
}

export interface SynestheticVisualConfig {
  dominantHue: number; // 0 to 360
  saturation: number; // 0 to 100
  lightness: number; // 0 to 100
  accentHex: string;
  geometryType: 'organic-spiral' | 'hyperbolic-lattice' | 'fluid-vortices' | 'crystalline-fractal' | 'quantum-cloud';
  motionSpeed: number;
  tactileTexture: 'smooth' | 'crystalline' | 'viscous' | 'aerated' | 'metallic' | 'fibrous';
}

export interface SynestheticHapticConfig {
  vibrationPatternMs: number[];
  intensityRatio: number;
  tactileDescription: string;
}

export interface SynesthesiaResult {
  inputDescription: string;
  crossModalDescription: string;
  audio: SynestheticAudioConfig;
  visual: SynestheticVisualConfig;
  haptic: SynestheticHapticConfig;
  sensoryMetaphor: string;
}

export interface CriticScore {
  novelty: number; // 0 to 10 (Distance from training distribution)
  coherence: number; // 0 to 10 (Internal consistency and causal plausibility)
  surprise: number; // 0 to 10 (Information gain vs expectations)
  usefulness: number; // 0 to 10 (Potential to solve problems or inspire creativity)
  aesthetic: number; // 0 to 10 (Learned human aesthetic alignment)
  edgeOfChaosScore: number; // 0 to 10 (Peak optimal around 7.5 - 8.5)
  edgeOfChaosZone: 'too_boring' | 'edge_of_chaos' | 'nonsense';
  verdict: 'ACCEPTED' | 'REJECTED' | 'REFINE';
  critiqueNotes: string;
  improvementSuggestion: string;
}

export interface SelfPlayIteration {
  round: number;
  imaginatorProposal: string;
  criticFeedback: string;
  criticScore: CriticScore;
  refinedHypothesis: string;
}

export interface SelfPlayResult {
  initialPrompt: string;
  iterations: SelfPlayIteration[];
  finalSynthesis: string;
  totalGainNovelty: number;
  totalGainCoherence: number;
}

export interface CKGEntry {
  id: string;
  timestamp: string;
  module: string;
  prompt: string;
  constraintsRelaxed: string[];
  governanceDecision: GovernanceDecision;
  scores?: CriticScore;
  summary: string;
  outputPayload: unknown;
}

export interface RLHFRating {
  id: string;
  timestamp: string;
  itemId: string;
  prompt: string;
  userRating: number; // 1 to 10
  feedbackCategory: 'too_conventional' | 'balanced_mastery' | 'incoherent_noise' | 'genius_leap';
  comment?: string;
}
