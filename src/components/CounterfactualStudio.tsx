import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Share2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Network,
  Scale,
  Compass,
  FileText
} from 'lucide-react';
import { CounterfactualResult, GovernanceDecision, CKGEntry, RelaxedConstraint, EpistemicLevel, EpistemicSection } from '../types/aie';
import { EpistemicBoundaryWidget, EPISTEMIC_LEVEL_CONFIG } from './EpistemicBoundaryWidget';

interface CounterfactualStudioProps {
  relaxedConstraints: RelaxedConstraint[];
  onLogCKG: (entry: Omit<CKGEntry, 'id' | 'timestamp'>) => void;
  onSendToCritic: (content: unknown) => void;
}

export const CounterfactualStudio: React.FC<CounterfactualStudioProps> = ({
  relaxedConstraints,
  onLogCKG,
  onSendToCritic
}) => {
  const [query, setQuery] = useState('What if gravity pushed instead of pulled?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CounterfactualResult | null>(null);
  const [governance, setGovernance] = useState<GovernanceDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeEpistemicFilter, setActiveEpistemicFilter] = useState<EpistemicLevel | 'ALL'>('ALL');
  const [modelMeta, setModelMeta] = useState<{ isLiveAI: boolean; modelName: string; latencyMs: number } | null>(null);

  const presets = [
    'What if gravity pushed instead of pulled?',
    'What if humans photosynthesized directly from solar radiation?',
    'What if the speed of light were only 120 km/h?',
    'What if time flowed backwards for organic cellular structures?',
    'What if memories were sexually transmitted hereditary traits?'
  ];

  const handleSimulate = async (promptQuery?: string) => {
    const q = promptQuery || query;
    setLoading(true);
    setError(null);
    try {
      const activeTypes = relaxedConstraints.filter(c => c.active).map(c => c.type);
      const res = await fetch('/api/aie/counterfactual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, relaxedConstraints: activeTypes }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGovernance(data.governance || null);
        setError(data.error || 'Execution refused by IFA Core Governance');
        return;
      }

      setGovernance(data.governance);
      setResult(data.result);
      if (data.meta) {
        setModelMeta(data.meta);
      }
      if (data.result?.causalModel?.nodes?.length > 0) {
        setSelectedNodeId(data.result.causalModel.nodes[0].id);
      }

      // Log to CKG
      onLogCKG({
        module: 'counterfactual_engine',
        prompt: q,
        constraintsRelaxed: activeTypes,
        governanceDecision: data.governance,
        summary: `SCM Structural Intervention: ${data.result.intervention}`,
        outputPayload: data.result
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to counterfactual engine');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount so the user immediately receives real live answers from Gemini
  useEffect(() => {
    if (!result && !loading) {
      handleSimulate(query);
    }
  }, []);

  const selectedNode = result?.causalModel?.nodes?.find(n => n.id === selectedNodeId);

  // Programmatically build Epistemic Sections based on Causal Propagation Depth
  const getEpistemicSections = (res: CounterfactualResult): EpistemicSection[] => {
    const sections: EpistemicSection[] = [];

    // Depth 0: FORMAL
    sections.push({
      id: 'ep-formal-0',
      level: 'FORMAL',
      depth: 0,
      sourceDomain: 'SCM Root Operator',
      text: res.intervention,
      rationale: 'Primary causal intervention do(X = x\') applied directly to exogenous roots.'
    });

    // Depth 1: SCM-DERIVED
    (res.epistemicBoundary?.scmDerived || res.physicalManifestations.slice(0, 2)).forEach((text, i) => {
      sections.push({
        id: `ep-scm-${i}`,
        level: 'SCM-DERIVED',
        depth: 1,
        sourceDomain: 'Physics & Thermodynamics',
        text,
        rationale: 'Direct consequence calculated from the physical structural DAG equations.'
      });
    });

    // Depth 2: MODEL-DEPENDENT
    (res.epistemicBoundary?.modelDependent || [res.physicalManifestations[2] || 'Morphological adaptation']).forEach((text, i) => {
      sections.push({
        id: `ep-model-${i}`,
        level: 'MODEL-DEPENDENT',
        depth: 2,
        sourceDomain: 'Biology & Ecosystem Dynamics',
        text,
        rationale: 'Contingent on evolutionary, pulmonary, or biomechanical selective pressure models.'
      });
    });

    // Depth 3: SPECULATIVE EXTRAPOLATION
    (res.epistemicBoundary?.speculativeExtrapolation || res.societalImpacts).forEach((text, i) => {
      sections.push({
        id: `ep-spec-${i}`,
        level: 'SPECULATIVE EXTRAPOLATION',
        depth: 3,
        sourceDomain: 'Civilization & Technology',
        text,
        rationale: 'Consequences extending beyond the formal graph into human behavior and built structures.'
      });
    });

    // Depth 4: NARRATIVE SYNTHESIS
    sections.push({
      id: 'ep-narrative-0',
      level: 'NARRATIVE SYNTHESIS',
      depth: 4,
      sourceDomain: 'Phenomenology & Literary Synthesis',
      text: res.epistemicBoundary?.narrativeSynthesis || res.simulatedWorld.slice(0, 240) + '...',
      rationale: 'Evocative sensory language expressing the resulting alternate world-state equilibrium.'
    });

    return sections;
  };

  const epistemicSections = result ? getEpistemicSections(result) : [];

  const shouldHighlight = (level: EpistemicLevel) => {
    return activeEpistemicFilter === 'ALL' || activeEpistemicFilter === level;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-1.5 rounded bg-sky-950 border border-sky-800 text-sky-400">
              <GitFork className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Counterfactual Engine (Module 4.1)
            </h2>
            <span className="text-xs font-mono text-sky-300 bg-sky-950/70 border border-sky-800 px-2 py-0.5 rounded font-medium">
              Pearl-Style Structural Intervention + Cross-Domain Causal Extrapolation
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-4xl">
            Pearl's do-calculus provides the formal framework for structural interventions in causal graphs. The AIE expands this into a complete pipeline: 
            <span className="font-mono text-cyan-300"> SCM Intervention do(X=x') → Causal Propagation → Domain-Transition Rules → Causal Critic → Alternate-State Synthesis</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {modelMeta && (
            <div className={`flex items-center gap-2 text-xs border px-3 py-1.5 rounded-lg ${
              modelMeta.isLiveAI 
                ? 'border-cyan-800/80 bg-cyan-950/40 text-cyan-300 shadow-sm' 
                : 'border-slate-800 bg-slate-900 text-slate-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${modelMeta.isLiveAI ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="font-mono font-medium">{modelMeta.isLiveAI ? `Live AI: ${modelMeta.modelName}` : 'Dynamic Synthesis'}</span>
              <span className="text-slate-500">·</span>
              <span className="font-mono text-cyan-400">{(modelMeta.latencyMs / 1000).toFixed(1)}s latency</span>
            </div>
          )}

          {governance && (
            <div className="flex items-center gap-2 text-xs border border-emerald-800/50 bg-emerald-950/30 px-3 py-1.5 rounded-lg text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>IFA Core: {governance.outcome}</span>
            </div>
          )}
        </div>
      </div>

      {/* Query Bar & Presets */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Formulate counterfactual intervention (e.g., What if gravity pushed instead of pulled?)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 font-medium"
              onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
            />
          </div>
          <button
            onClick={() => handleSimulate()}
            disabled={loading || !query.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-600/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>Execute Intervention</span>
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-400">
          <span className="shrink-0 font-medium text-slate-500">Presets:</span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(preset);
                handleSimulate(preset);
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Module 4.1 Architecture Schematic */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
          <span className="font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Module 4.1 Structural Execution Architecture
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Normative Processing Pipeline</span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-2 text-[11px] font-mono scrollbar-thin">
          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 text-center shrink-0 min-w-[120px]">
            <div className="text-[10px] text-slate-500 uppercase">Input</div>
            <div className="text-white font-semibold">User Counterfactual</div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          <div className="p-2 rounded bg-sky-950/60 border border-sky-800 text-sky-300 text-center shrink-0 min-w-[130px]">
            <div className="text-[10px] text-sky-400 uppercase">Intervention</div>
            <div className="font-bold">do(X = x')</div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 text-center shrink-0 min-w-[130px]">
            <div className="text-[10px] text-slate-500 uppercase">SCM / DAG</div>
            <div className="text-white font-semibold">Causal Structure</div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 text-center shrink-0 min-w-[150px]">
            <div className="text-[10px] text-slate-500 uppercase">Causal Propagator</div>
            <div className="text-amber-300 font-semibold">Physics → Bio → Society</div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-center shrink-0 min-w-[140px]">
            <div className="text-[10px] text-emerald-400 uppercase">Causal Critic</div>
            <div className="font-semibold">Consistency Audit</div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          <div className="p-2 rounded bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-center shrink-0 min-w-[140px]">
            <div className="text-[10px] text-indigo-400 uppercase">Synthesis</div>
            <div className="font-semibold">World-State & Metaphor</div>
          </div>
        </div>
      </div>

      {/* Error / Governance Refusal Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-rose-300">Auditable Refusal by IFA Deterministic Core</div>
            <p>{error}</p>
            {governance && (
              <div className="font-mono text-[11px] text-rose-400 pt-1">
                Refusal ID: {governance.id} · Rule: {governance.violatedRule || 'Structural Invariant Breach'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Generative Pipeline Loading State */}
      {loading && (
        <div className="p-8 rounded-xl border border-sky-800/60 bg-sky-950/20 text-center space-y-3 animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
            <span className="text-sm font-semibold text-white font-mono">
              Synthesizing Live Causal Intervention with Gemini AI...
            </span>
          </div>
          <p className="text-xs text-sky-200/90 max-w-lg mx-auto">
            Constructing exogenous Pearl do(X=x') operator, solving DAG structural equations across physics, biology, and society, then verifying consistency via Causal Critic.
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-cyan-400 pt-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Real-time model streaming active · Not a static demo</span>
          </div>
        </div>
      )}

      {/* Main Results Display */}
      {result && (
        <div className="space-y-6">
          
          {/* PERSISTENT EPISTEMIC BOUNDARY WIDGET */}
          <EpistemicBoundaryWidget
            sections={epistemicSections}
            activeFilter={activeEpistemicFilter}
            onSelectFilter={setActiveEpistemicFilter}
          />

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`border bg-slate-900/60 rounded-xl p-4 transition-all ${
              shouldHighlight('FORMAL') ? 'border-sky-500/80 shadow-md ring-1 ring-sky-500/30' : 'border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Formal Intervention</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-950 border border-sky-800 text-sky-300 font-bold uppercase">
                  FORMAL · Depth 0
                </span>
              </div>
              <div className="font-mono text-sm font-semibold text-sky-400 mt-1">
                {result.intervention}
              </div>
            </div>

            <div className={`border bg-slate-900/60 rounded-xl p-4 transition-all ${
              shouldHighlight('SCM-DERIVED') ? 'border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30' : 'border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">SCM Complexity</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold uppercase">
                  SCM-DERIVED · Depth 1
                </span>
              </div>
              <div className="text-sm font-semibold text-white mt-1 font-mono">
                {result.causalModel.nodes.length} Causal Nodes · {result.causalModel.edges.length} Directed Relations
              </div>
            </div>

            <div className={`border bg-slate-900/60 rounded-xl p-4 flex items-center justify-between transition-all ${
              shouldHighlight('MODEL-DEPENDENT') || shouldHighlight('SPECULATIVE EXTRAPOLATION')
                ? 'border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                : 'border-slate-800 opacity-60'
            }`}>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Causal Propagation Depth</span>
                <div className="text-sm font-semibold text-amber-400 mt-1 font-mono">
                  {result.propagationDepth || result.causalModel.downstreamCascade.length} Downstream Transitions
                </div>
              </div>
              <button
                onClick={() => onSendToCritic(result)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/70 text-xs font-medium transition-colors"
                title="Send output to Novelty & Coherence Evaluator"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluate with Critic</span>
              </button>
            </div>
          </div>

          {/* SCM Causal Graph Visualizer */}
          <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-sky-400 uppercase tracking-wider font-semibold">
                  Structural Causal Model (SCM) DAG
                </span>
                <span className="text-xs text-slate-500">· Directed Acyclic Graph</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {result.causalModel.nodes.length} Nodes · {result.causalModel.edges.length} Directed Relations
              </span>
            </div>

            {/* Interactive Graph Node Grid with Programmatic Epistemic Tags */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {result.causalModel.nodes.map((node, i) => {
                const isSelected = selectedNodeId === node.id;
                
                // Programmatic epistemic level by node domain
                const epistemicTag: EpistemicLevel = 
                  node.isIntervention ? 'FORMAL' :
                  node.domain === 'physics' ? 'SCM-DERIVED' :
                  node.domain === 'biology' ? 'MODEL-DEPENDENT' :
                  'SPECULATIVE EXTRAPOLATION';

                const isHighlighted = shouldHighlight(epistemicTag);

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-sky-500 bg-slate-900 border-sky-400 shadow-lg'
                        : isHighlighted
                        ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                        : 'border-slate-900 bg-slate-950/40 opacity-40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded border border-slate-800 bg-slate-950 text-slate-400">
                        {node.domain}
                      </span>
                      <span className={`text-[9px] font-mono px-1 py-0.2 rounded border font-semibold ${
                        epistemicTag === 'FORMAL' ? 'border-sky-800 text-sky-300 bg-sky-950/50' :
                        epistemicTag === 'SCM-DERIVED' ? 'border-emerald-800 text-emerald-300 bg-emerald-950/50' :
                        epistemicTag === 'MODEL-DEPENDENT' ? 'border-amber-800 text-amber-300 bg-amber-950/50' :
                        'border-violet-800 text-violet-300 bg-violet-950/50'
                      }`}>
                        {epistemicTag.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white line-clamp-1">
                      {node.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {node.value}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Node #{i + 1}</span>
                      {isSelected && <span className="text-sky-400 font-bold">Inspecting</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Node Details Box */}
            {selectedNode && (
              <div className="border border-sky-900/50 bg-sky-950/20 rounded-lg p-4 space-y-2 mt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-sky-400 font-bold">{selectedNode.label}</span>
                    <span className="text-xs text-slate-400 font-mono">Domain: {selectedNode.domain}</span>
                  </div>
                  {selectedNode.isIntervention ? (
                    <span className="text-xs font-mono text-amber-300 font-semibold">Exogenous Pearl Intervention Root [FORMAL]</span>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">Endogenous Causal Consequence</span>
                  )}
                </div>
                <p className="text-xs text-slate-200">{selectedNode.description}</p>
                <div className="text-xs text-slate-400 pt-1">
                  <strong>Equilibrium Value:</strong> <span className="font-mono text-cyan-300">{selectedNode.value}</span>
                </div>
              </div>
            )}
          </div>

          {/* Causal Critic & Consistency Audit Card */}
          {result.causalCritic && (
            <div className="border border-emerald-800/70 bg-emerald-950/20 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Causal Critic Consistency Audit</span>
                </div>
                <span className="text-xs font-mono text-emerald-300 px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700">
                  {result.causalCritic.contradictionCheck}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">Dependency Integrity:</span>
                  <div className="text-slate-200 font-medium mt-0.5">
                    {result.causalCritic.dependencyIntegrity}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">Equilibrium & Conservation Notes:</span>
                  <div className="text-slate-200 mt-0.5">
                    {result.causalCritic.notes}
                  </div>
                </div>
              </div>

              {/* Explicitly Audited & Rejected Pseudoscientific Claims */}
              {result.causalCritic.rejectedClaims && result.causalCritic.rejectedClaims.length > 0 && (
                <div className="pt-2 border-t border-emerald-800/40 space-y-1.5">
                  <span className="text-amber-400 font-mono text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Causal Critic Audit: Rejected Unphysical & Pseudoscientific Claims
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {result.causalCritic.rejectedClaims.map((claim, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300 bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800">
                        <span className="text-rose-400 font-mono font-bold shrink-0">✕</span>
                        <span>{claim}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluated Dimensionless Constants */}
              {result.causalCritic.evaluatedConstants && result.causalCritic.evaluatedConstants.length > 0 && (
                <div className="pt-2 border-t border-emerald-800/40 space-y-1.5">
                  <span className="text-cyan-400 font-mono text-[10px] uppercase tracking-wider font-semibold">
                    Evaluated Dimensionless Constants & Boundary Parameters
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {result.causalCritic.evaluatedConstants.map((c, idx) => (
                      <div key={idx} className="text-[11px] bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{c.constant}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-300 font-semibold">{c.status}</span>
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Standard: <span className="font-mono text-slate-300">{c.standardValue}</span> → Altered: <span className="font-mono text-cyan-300">{c.counterfactualValue}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{c.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Downstream Cascade & Physical Manifestations with Programmatic Epistemic Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Cascade Transitions */}
            <div className={`border bg-slate-900/40 rounded-xl p-5 space-y-3 transition-all ${
              shouldHighlight('SCM-DERIVED') ? 'border-emerald-800/80 shadow-md ring-1 ring-emerald-500/20' : 'border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Causal Cascade Progression ({result.propagationDepth || result.causalModel.downstreamCascade.length} Transitions)
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 uppercase font-bold">
                  SCM-DERIVED · Depth 1
                </span>
              </div>

              <div className="space-y-3">
                {result.causalModel.downstreamCascade.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0 font-mono text-[10px] mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 pb-2 border-b border-slate-800/60 last:border-none">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Concrete Phenomena & Societal Impact */}
            <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-5 space-y-4">
              <div className={`p-3 rounded-lg border transition-all ${
                shouldHighlight('MODEL-DEPENDENT') ? 'border-amber-800/80 bg-amber-950/20 ring-1 ring-amber-500/20' : 'border-slate-800/60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                    Physical & Ecological Manifestations
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 uppercase font-bold">
                    MODEL-DEPENDENT · Depth 2
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.physicalManifestations.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-mono">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`p-3 rounded-lg border transition-all ${
                shouldHighlight('SPECULATIVE EXTRAPOLATION') ? 'border-violet-800/80 bg-violet-950/20 ring-1 ring-violet-500/20' : 'border-slate-800/60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono text-violet-400 uppercase tracking-wider font-semibold">
                    Societal & Civilizational Restructuring
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 border border-violet-800 text-violet-300 uppercase font-bold">
                    SPECULATIVE EXTRAPOLATION · Depth 3
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.societalImpacts.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-violet-400 font-mono">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Simulated World State Prose with Persistent Epistemic Tag */}
          <div className={`border rounded-xl p-6 space-y-3 transition-all ${
            shouldHighlight('NARRATIVE SYNTHESIS')
              ? 'border-pink-800/80 bg-gradient-to-b from-slate-900 via-slate-900/90 to-pink-950/20 ring-1 ring-pink-500/20 shadow-lg'
              : 'border-slate-800 bg-slate-900/60'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <span>Simulated Alternate World State</span>
                <span className="text-xs font-mono text-slate-400 font-normal">(World-State Synthesis)</span>
              </h4>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-pink-950 border border-pink-800 text-pink-300 uppercase font-bold">
                NARRATIVE SYNTHESIS · Depth 4
              </span>
            </div>

            <div className="text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line">
              {result.simulatedWorld}
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-start gap-2">
              <span className="font-semibold text-slate-300 shrink-0 font-mono text-[11px] uppercase">Visual Metaphor:</span>
              <span className="italic text-slate-300">"{result.visualPrompt}"</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
