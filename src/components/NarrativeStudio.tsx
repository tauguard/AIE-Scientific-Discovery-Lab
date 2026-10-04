import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  RefreshCw, 
  GitBranch, 
  TrendingUp, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck,
  ChevronRight,
  Scale
} from 'lucide-react';
import { NarrativeResult, NarrativeStep, CKGEntry, RelaxedConstraint, EpistemicLevel, EpistemicSection } from '../types/aie';
import { EpistemicBoundaryWidget, EPISTEMIC_LEVEL_CONFIG } from './EpistemicBoundaryWidget';

interface NarrativeStudioProps {
  relaxedConstraints: RelaxedConstraint[];
  onLogCKG: (entry: Omit<CKGEntry, 'id' | 'timestamp'>) => void;
  onSendToCritic: (content: unknown) => void;
}

export const NarrativeStudio: React.FC<NarrativeStudioProps> = ({
  relaxedConstraints,
  onLogCKG,
  onSendToCritic
}) => {
  const [prompt, setPrompt] = useState('First contact scenario');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NarrativeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBranchNotice, setActiveBranchNotice] = useState<string | null>(null);
  const [activeEpistemicFilter, setActiveEpistemicFilter] = useState<EpistemicLevel | 'ALL'>('ALL');
  const [modelMeta, setModelMeta] = useState<{ isLiveAI: boolean; modelName: string; latencyMs: number } | null>(null);

  const presets = [
    'First contact scenario',
    'The discovery that entropy flows backwards on Neptune',
    'The city where gravity is an artificial currency traded on markets',
    'An archaeologist discovers our contemporary internet encoded in fossilized amber'
  ];

  const handleConstruct = async (customPrompt?: string) => {
    const p = customPrompt || prompt;
    setLoading(true);
    setError(null);
    setActiveBranchNotice(null);
    try {
      const activeTypes = relaxedConstraints.filter(c => c.active).map(c => c.type);
      const res = await fetch('/api/aie/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p, relaxedConstraints: activeTypes }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Narrative constructor failed');
        return;
      }

      setResult(data.result);
      if (data.meta) {
        setModelMeta(data.meta);
      }

      onLogCKG({
        module: 'narrative_constructor',
        prompt: p,
        constraintsRelaxed: activeTypes,
        governanceDecision: data.governance,
        summary: `Hierarchical Narrative Arc: ${data.result.arcTitle}`,
        outputPayload: data.result
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to scenario constructor');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount so users immediately see real live AI output
  useEffect(() => {
    if (!result && !loading) {
      handleConstruct(prompt);
    }
  }, []);

  // Programmatically map each narrative step to its causal propagation generation depth
  const getEpistemicLevelForStage = (stage: NarrativeStep['stage'], stepLevel?: EpistemicLevel): { level: EpistemicLevel; depth: number } => {
    if (stepLevel) {
      return {
        level: stepLevel,
        depth: EPISTEMIC_LEVEL_CONFIG[stepLevel].depth
      };
    }
    switch (stage) {
      case 'setup':
        return { level: 'FORMAL', depth: 0 };
      case 'rising_tension':
        return { level: 'SCM-DERIVED', depth: 1 };
      case 'climax':
        return { level: 'MODEL-DEPENDENT', depth: 2 };
      case 'twist':
        return { level: 'SPECULATIVE EXTRAPOLATION', depth: 3 };
      case 'resolution':
        return { level: 'NARRATIVE SYNTHESIS', depth: 4 };
    }
  };

  const getEpistemicSections = (res: NarrativeResult): EpistemicSection[] => {
    return res.steps.map((step, idx) => {
      const { level, depth } = getEpistemicLevelForStage(step.stage, step.epistemicLevel);
      return {
        id: `narrative-ep-${idx}`,
        level,
        depth,
        sourceDomain: `Narrative Stage: ${step.stage.toUpperCase()}`,
        text: step.narrativeText,
        rationale: step.causalReasoning
      };
    });
  };

  const epistemicSections = result ? getEpistemicSections(result) : [];

  const shouldHighlight = (stage: NarrativeStep['stage'], stepLevel?: EpistemicLevel) => {
    if (activeEpistemicFilter === 'ALL') return true;
    const { level } = getEpistemicLevelForStage(stage, stepLevel);
    return level === activeEpistemicFilter;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-teal-950 border border-teal-800 text-teal-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Narrative & Scenario Constructor (Module 4.5)
            </h2>
            <span className="text-xs font-mono text-teal-400 bg-teal-950/60 border border-teal-800/80 px-2 py-0.5 rounded">
              Hierarchical Planning · Epistemic Tagging
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Synthesizes multi-step temporal scenarios with strict emotional tension arcs and branching counterfactual decisions. Programmatically tagged by causal generation depth (Depth 0 → 4).
          </p>
        </div>

        {modelMeta && (
          <div className={`flex items-center gap-2 text-xs border px-3 py-1.5 rounded-lg shrink-0 ${
            modelMeta.isLiveAI 
              ? 'border-teal-800/80 bg-teal-950/40 text-teal-300 shadow-sm' 
              : 'border-slate-800 bg-slate-900 text-slate-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${modelMeta.isLiveAI ? 'bg-teal-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="font-mono font-medium">{modelMeta.isLiveAI ? `Live AI: ${modelMeta.modelName}` : 'Dynamic Synthesis'}</span>
            <span className="text-slate-500">·</span>
            <span className="font-mono text-teal-400">{(modelMeta.latencyMs / 1000).toFixed(1)}s latency</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Specify narrative scenario prompt..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
            onKeyDown={(e) => e.key === 'Enter' && handleConstruct()}
          />
          <button
            onClick={() => handleConstruct()}
            disabled={loading || !prompt.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-md shadow-teal-600/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>Construct Scenario</span>
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs text-slate-400 pt-1">
          <span className="shrink-0 text-slate-500 font-medium">Scenario Seeds:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(p);
                handleConstruct(p);
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real-time Generative Pipeline Loading State */}
      {loading && (
        <div className="p-8 rounded-xl border border-teal-800/60 bg-teal-950/20 text-center space-y-3 animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
            <span className="text-sm font-semibold text-white font-mono">
              Generating Hierarchical Narrative & Epistemic Arc with Gemini AI...
            </span>
          </div>
          <p className="text-xs text-teal-200/90 max-w-lg mx-auto">
            Constructing 5-stage temporal narrative sequence (Setup → Rising Tension → Climax → Twist → Resolution) with epistemic generation depth tags and emotional tension dynamics.
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-cyan-400 pt-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Live model synthesis active · Not a static template</span>
          </div>
        </div>
      )}

      {/* Main Results View */}
      {result && (
        <div className="space-y-6">
          
          {/* PERSISTENT EPISTEMIC BOUNDARY WIDGET */}
          <EpistemicBoundaryWidget
            sections={epistemicSections}
            activeFilter={activeEpistemicFilter}
            onSelectFilter={setActiveEpistemicFilter}
          />

          {/* Header Card */}
          <div className="border border-teal-800/60 bg-gradient-to-r from-teal-950/40 via-slate-900/60 to-emerald-950/40 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-teal-400 uppercase tracking-wider">
                  Scenario Title
                </span>
                <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                  {result.arcTitle}
                </h3>
              </div>
              <button
                onClick={() => onSendToCritic(result)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/70 text-xs font-medium transition-colors self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluate with Critic</span>
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed mt-3">
              {result.summary}
            </p>
          </div>

          {/* Emotional Tension Curve Plot */}
          <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-mono text-white uppercase tracking-wider font-semibold">
                  Normative Emotional Tension Curve
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Setup → Rising Tension → Climax → Twist → Resolution
              </span>
            </div>

            {/* SVG Tension Arc Plot */}
            <div className="h-44 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="tensionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />

                {/* Points curve */}
                {(() => {
                  const points = result.steps.map((s, idx) => {
                    const x = (idx / (result.steps.length - 1)) * 480 + 10;
                    const y = 110 - (s.tensionLevel / 100) * 90;
                    return { x, y, stage: s.stage, tension: s.tensionLevel };
                  });

                  const pathD = points.reduce((acc, p, i) => {
                    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                  }, '');

                  const areaD = `${pathD} L ${points[points.length - 1].x} 120 L ${points[0].x} 120 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#tensionGrad)" />
                      <path d={pathD} fill="none" stroke="#2dd4bf" strokeWidth="2.5" />
                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#0f172a" stroke="#2dd4bf" strokeWidth="2.5" />
                          <text x={p.x} y={p.y - 10} fill="#99f6e4" fontSize="10" textAnchor="middle" fontFamily="monospace">
                            {p.tension}%
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Branch Notification Banner */}
          {activeBranchNotice && (
            <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-800 text-teal-200 text-xs flex items-start gap-3">
              <GitBranch className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-white">Alternate Causal Branch Explored:</span>
                <p>{activeBranchNotice}</p>
              </div>
            </div>
          )}

          {/* Five Step Sequence Cards Programmatically Tagged with Epistemic Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Hierarchical Temporal Stages & Epistemic Boundaries
              </h4>
              {activeEpistemicFilter !== 'ALL' && (
                <span className="text-xs font-mono text-amber-300">
                  Filtered to: {activeEpistemicFilter}
                </span>
              )}
            </div>

            {result.steps.map((step, idx) => {
              const stageLabels = {
                setup: '01. Exposition & Premise',
                rising_tension: '02. Causal Escalation',
                climax: '03. Structural Climax',
                twist: '04. Counterfactual Twist',
                resolution: '05. Philosophical Resolution'
              };

              const { level, depth } = getEpistemicLevelForStage(step.stage, step.epistemicLevel);
              const config = EPISTEMIC_LEVEL_CONFIG[level];
              const isHighlighted = shouldHighlight(step.stage, step.epistemicLevel);

              return (
                <div
                  key={idx}
                  className={`border rounded-xl p-5 space-y-3 transition-all ${
                    isHighlighted
                      ? `${config.colorBorder} bg-slate-900/70 shadow-md ring-1 ring-current`
                      : 'border-slate-800 bg-slate-950/30 opacity-40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-teal-400 font-bold uppercase">
                        {stageLabels[step.stage] || step.stage}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <h4 className="text-sm font-semibold text-white">
                        {step.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Programmatic Epistemic Tag */}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase ${config.colorBg} ${config.colorBorder} ${config.colorText}`}>
                        {level} · Depth {depth}
                      </span>

                      <div className="text-xs font-mono text-slate-400">
                        Tension: <strong className="text-teal-400">{step.tensionLevel}%</strong>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed">
                    {step.narrativeText}
                  </p>

                  <div className="pt-2 flex items-start gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300 font-mono shrink-0">Causal Logic ({level}):</span>
                    <span className="italic">{step.causalReasoning}</span>
                  </div>

                  {/* Branching Alternative Options */}
                  {step.branchingOptions && step.branchingOptions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                      <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Branching Pivot Paths:</span>
                      </span>
                      <div className="space-y-1.5">
                        {step.branchingOptions.map((opt, bIdx) => (
                          <div 
                            key={bIdx}
                            onClick={() => setActiveBranchNotice(opt.alternateConsequence)}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-700/60 text-xs cursor-pointer group transition-colors"
                          >
                            <span className="text-slate-300 group-hover:text-cyan-300 transition-colors">
                              Option {bIdx + 1}: "{opt.choiceText}"
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
