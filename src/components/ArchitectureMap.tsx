import React from 'react';
import { 
  ShieldCheck, 
  Compass, 
  Sliders, 
  Cpu, 
  GitFork, 
  Sparkles, 
  Activity, 
  BookOpen, 
  Volume2, 
  CheckCircle2, 
  ArrowDown, 
  ExternalLink,
  FlaskConical
} from 'lucide-react';
import { EngineMode } from '../types/aie';

interface ArchitectureMapProps {
  onSelectMode: (mode: EngineMode) => void;
}

export const ArchitectureMap: React.FC<ArchitectureMapProps> = ({ onSelectMode }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Intro Hero Section */}
      <div className="border border-slate-800 rounded-xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-6 sm:p-8 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono tracking-wider uppercase">
              <span>Normative Specification v1.0</span>
              <span>·</span>
              <span>May 27, 2026</span>
              <span>·</span>
              <span>Michal Harcej</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Pattern Transcendence, Not Merely Pattern Completion
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Standard Generative AI models are strictly interpolative pattern completers. The <strong>Artificial Imagination Engine (AIE)</strong> provides the normative blueprint for structured extrapolation beyond known training distributions — guided by causal world models, selective constraint suspension, conceptual blending, unguided curiosity dreaming, and non-negotiable IFA Core deterministic governance.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs space-y-2 min-w-[240px]">
            <div className="text-slate-400 font-medium pb-1 border-b border-slate-800">
              Foundational Research Anchors
            </div>
            <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
              <div>• Judea Pearl: Causality & Do-Calculus</div>
              <div>• Yann LeCun: JEPA World Modeling</div>
              <div>• Fauconnier & Turner: Conceptual Blending</div>
              <div>• DreamerV3 / Hafner: Imagination RL</div>
              <div>• IFA Core v1.0: Deterministic Governance</div>
              <div>• Olah et al.: Activation Maximization</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Architecture Flowchart (Normative Diagram Section 3.1) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>High-Level Architecture Pipeline</span>
            <span className="text-xs font-mono font-normal text-slate-400">(Section 3.1)</span>
          </h3>
          <span className="text-xs text-slate-400">Click any component to open its interactive studio</span>
        </div>

        <div className="flex flex-col items-center space-y-3">
          
          {/* Layer 1: Governance Layer */}
          <div 
            onClick={() => onSelectMode('ckg-audit')}
            className="w-full border border-cyan-800/80 bg-cyan-950/20 hover:bg-cyan-950/40 transition-all rounded-lg p-4 cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-cyan-900/40 text-cyan-400 border border-cyan-700/50">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Layer 01</span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      Governance Layer (IFA Core Specification v1.0 Compliance)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Structural Invariants (Safety, Ethics, Legality, Resource Limits) · Executable Governance via Canonical Knowledge Graph (CKG) · Authority Separation & Auditable Refusal
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-600" />

          {/* Layer 2: Curiosity & Drive Layer */}
          <div 
            onClick={() => onSelectMode('dream')}
            className="w-full border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all rounded-lg p-4 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-indigo-900/40 text-indigo-400 border border-indigo-700/50">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Layer 02</span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      Curiosity & Drive Layer
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Determines imaginative objectives: novelty maximization, aesthetic resonance, problem-solving, and unguided concept traversal
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-600" />

          {/* Layer 3: Constraint Relaxation Engine */}
          <div 
            onClick={() => onSelectMode('constraints')}
            className="w-full border border-amber-800/60 bg-amber-950/20 hover:bg-amber-950/30 transition-all rounded-lg p-4 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-amber-900/40 text-amber-400 border border-amber-700/50">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Layer 03</span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                      Constraint Relaxation Engine
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Selectively suspends structural invariants: gravity, time arrow, quantum-macro scale, identity, paraconsistent logic, biology. Ensures reversibility and tracks stability
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-600" />

          {/* Layer 4: World Model Core (JEPA) */}
          <div className="w-full border border-slate-700 bg-slate-900/90 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-700/50">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Layer 04</span>
                  <h4 className="text-sm font-semibold text-white">
                    World Model Core (Causal, Not Correlational)
                  </h4>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Grounded in Yann LeCun's JEPA representations. Learns action-to-outcome mechanics: “If action X occurs, then outcome Y follows causally”
                </p>
              </div>
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-600" />

          {/* Hack-Nation Challenge #3: Scientific Discovery Lab */}
          <div 
            onClick={() => onSelectMode('discovery')}
            className="w-full border border-cyan-500/80 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-cyan-950/40 hover:border-cyan-400 transition-all rounded-lg p-4 cursor-pointer group shadow-lg shadow-cyan-500/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-500/50">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">Hack-Nation Challenge #3</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">Databricks Agentic Discovery</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    AIE Scientific Discovery Lab: Autonomous Empirical Investigation
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Closed-loop scientific discovery: Question → Research → Competing Hypotheses → Parameter-Swept Experiment Planning → Deterministic Numerical Engine → Bayesian Analysis → Next Experiment Selection.
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-600" />

          {/* Dual Engine Split: Counterfactual & Conceptual Blender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            <div 
              onClick={() => onSelectMode('counterfactual')}
              className="border border-sky-800/70 bg-sky-950/20 hover:bg-sky-950/40 transition-all rounded-lg p-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-sky-900/40 text-sky-400 border border-sky-700/50">
                    <GitFork className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-sky-400 uppercase tracking-wider">Module 4.1</span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                      Counterfactual Engine: Pearl-Style Structural Intervention + Cross-Domain Extrapolation
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Integrates SCM interventions do(X=x') with cross-domain causal propagation (Physics → Biology → Society), causal critic validation, and epistemic boundaries.
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors shrink-0" />
              </div>
            </div>

            <div 
              onClick={() => onSelectMode('blender')}
              className="border border-violet-800/70 bg-violet-950/20 hover:bg-violet-950/40 transition-all rounded-lg p-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-violet-900/40 text-violet-400 border border-violet-700/50">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-violet-400 uppercase tracking-wider">Module 4.2</span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
                      Conceptual Blender
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Fauconnier & Turner's Conceptual Blending Theory. Structural alignment across distant domains to synthesize hybrid blend spaces with emergent properties.
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors shrink-0" />
              </div>
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-600" />

          {/* Free Association / Dream Module */}
          <div 
            onClick={() => onSelectMode('dream')}
            className="w-full border border-pink-800/70 bg-pink-950/20 hover:bg-pink-950/40 transition-all rounded-lg p-4 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-pink-900/40 text-pink-400 border border-pink-700/50">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-pink-400 uppercase tracking-wider">Module 4.3</span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-pink-300 transition-colors">
                      Free Association / Dream Module
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Unguided concept space traversal driven by curiosity RL. Reward = Novelty × Coherence × Surprise. Flags surprise peaks and surfaces novel hypotheses.
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors" />
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-600" />

          {/* Narrative / Scenario Constructor */}
          <div 
            onClick={() => onSelectMode('narrative')}
            className="w-full border border-teal-800/70 bg-teal-950/20 hover:bg-teal-950/40 transition-all rounded-lg p-4 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-teal-900/40 text-teal-400 border border-teal-700/50">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-teal-400 uppercase tracking-wider">Module 4.5</span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">
                      Narrative / Scenario Constructor
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Hierarchical temporal scenario planning. Governs emotional tension arcs (setup → rising tension → climax → twist → resolution) with branching counterfactual paths.
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-600" />

          {/* Multi-Modal Synthesis Engine */}
          <div 
            onClick={() => onSelectMode('synesthesia')}
            className="w-full border border-blue-800/70 bg-blue-950/20 hover:bg-blue-950/40 transition-all rounded-lg p-4 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-blue-900/40 text-blue-400 border border-blue-700/50">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">Module 4.6</span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                      Multi-Modal Synesthesia Engine
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Cross-modal mapping across 4 modalities: Text description, Visual generative geometry, real Web Audio acoustic harmonics, and tactile haptic pulse sequences.
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-600" />

          {/* Novelty & Coherence Evaluator (The Critic) */}
          <div 
            onClick={() => onSelectMode('critic')}
            className="w-full border border-emerald-800/80 bg-emerald-950/30 hover:bg-emerald-950/50 transition-all rounded-lg p-4 cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-700/50">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Module 4.7</span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      Novelty & Coherence Evaluator (The Critic)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Scores outputs on 5 normative dimensions: Novelty, Coherence, Surprise, Usefulness, Aesthetic. Enforces the “Edge of Chaos” zone (rejecting boring clichés and senseless noise).
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>

        </div>
      </div>

      {/* Normative Requirements Checklist */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/40 p-6 space-y-4">
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
          Normative Operational Principles (Section 1.1)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 font-mono">01.</span>
            <span><strong>Authority Separation:</strong> Deterministic core grants authority per transition, not per AI identity.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 font-mono">02.</span>
            <span><strong>Causal SCM Primacy:</strong> Extrapolations are calculated using Pearl do-calculus interventions, not predictive statistical word next-token completion.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 font-mono">03.</span>
            <span><strong>Edge of Chaos Zone:</strong> Outputs too close to known distribution are rejected as boring; outputs exceeding coherence boundaries are rejected as noise.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 font-mono">04.</span>
            <span><strong>Auditable Refusal:</strong> Violations of structural invariants halt in a terminal refusal state logged into the Canonical Knowledge Graph.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
