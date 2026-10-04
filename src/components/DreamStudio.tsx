import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  RefreshCw, 
  Flag, 
  Compass, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  TrendingUp, 
  Layers 
} from 'lucide-react';
import { DreamResult, DreamNode, CKGEntry } from '../types/aie';

interface DreamStudioProps {
  onLogCKG: (entry: Omit<CKGEntry, 'id' | 'timestamp'>) => void;
  onSendToCritic: (content: unknown) => void;
}

export const DreamStudio: React.FC<DreamStudioProps> = ({
  onLogCKG,
  onSendToCritic
}) => {
  const [seed, setSeed] = useState('cloud');
  const [steps, setSteps] = useState(8);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DreamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [modelMeta, setModelMeta] = useState<{ isLiveAI: boolean; modelName: string; latencyMs: number } | null>(null);

  const seedPresets = ['cloud', 'mirror', 'black hole', 'spiderweb', 'memory', 'entropy'];

  const handleDream = async (overrideSeed?: string) => {
    const s = overrideSeed || seed;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/aie/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: s, steps }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Dream module encountered a runtime failure');
        return;
      }

      setResult(data.result);
      if (data.meta) {
        setModelMeta(data.meta);
      }
      setSelectedStep(data.result?.trajectory?.[0]?.step || 1);

      // Log into CKG
      onLogCKG({
        module: 'dream_module',
        prompt: `Unguided Dream from seed "${s}" (${steps} steps)`,
        constraintsRelaxed: [],
        governanceDecision: data.governance,
        summary: `Dream trajectory peaked at surprise concept "${data.result.peakSurpriseConcept}"`,
        outputPayload: data.result
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate concept space walk');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount so the user immediately receives real live output from Gemini
  useEffect(() => {
    if (!result && !loading) {
      handleDream(seed);
    }
  }, []);

  const activeNode: DreamNode | undefined = result?.trajectory.find(n => n.step === selectedStep);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-pink-950 border border-pink-800 text-pink-400">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Free Association / Dream Module (Module 4.3)
            </h2>
            <span className="text-xs font-mono text-pink-400 bg-pink-950/60 border border-pink-800/80 px-2 py-0.5 rounded">
              Curiosity RL · Activation Maximization
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Unguided traversal of latent concept space driven by curiosity reinforcement learning: <code className="text-pink-300">Reward = Novelty × Coherence × Surprise</code>. Periodically flags and surfaces creative conceptual breakthroughs.
          </p>
        </div>

        {modelMeta && (
          <div className={`flex items-center gap-2 text-xs border px-3 py-1.5 rounded-lg ${
            modelMeta.isLiveAI 
              ? 'border-cyan-800/80 bg-cyan-950/40 text-cyan-300' 
              : 'border-slate-800 bg-slate-900 text-slate-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${modelMeta.isLiveAI ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="font-mono font-medium">{modelMeta.isLiveAI ? `Live AI: ${modelMeta.modelName}` : 'Dynamic Synthesis'}</span>
            <span className="text-slate-500">·</span>
            <span className="font-mono text-cyan-400">{(modelMeta.latencyMs / 1000).toFixed(1)}s latency</span>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Seed Concept Anchor
            </label>
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="e.g. cloud, mirror, fossil, light..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500 font-medium"
            />
          </div>

          <div className="w-full sm:w-48">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
              <span>Trajectory Steps:</span>
              <span className="text-pink-400 font-bold">{steps}</span>
            </div>
            <input
              type="range"
              min={4}
              max={12}
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value, 10))}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleDream()}
            disabled={loading || !seed.trim()}
            className="w-full sm:w-auto mt-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-md shadow-pink-600/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>Initiate Free Wander</span>
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs text-slate-400 pt-1">
          <span className="shrink-0 text-slate-500 font-medium">Seed Anchors:</span>
          {seedPresets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSeed(p);
                handleDream(p);
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
        <div className="p-8 rounded-xl border border-pink-800/60 bg-pink-950/20 text-center space-y-3 animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 text-pink-400 animate-spin" />
            <span className="text-sm font-semibold text-white font-mono">
              Traversing Latent Concept Space with Gemini AI...
            </span>
          </div>
          <p className="text-xs text-pink-200/90 max-w-lg mx-auto">
            Executing unguided latent walk guided by Curiosity RL (<code className="text-pink-300 font-mono">Reward = Novelty × Coherence × Surprise</code>). Identifying peak surprise inflection point and synthesizing novel insight.
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-cyan-400 pt-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Live model synthesis active · Not a static template</span>
          </div>
        </div>
      )}

      {/* Trajectory Timeline & Results */}
      {result && (
        <div className="space-y-6">
          {/* Top Novel Insight Card */}
          <div className="border border-pink-800/50 bg-gradient-to-r from-pink-950/30 via-slate-900/60 to-purple-950/30 rounded-xl p-5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-pink-400 uppercase tracking-wider font-semibold">
                  Synthesized Novel Insight
                </span>
                <span className="text-xs text-slate-400">· Surfaced to Higher Layers (Section 4.3.1)</span>
              </div>
              <button
                onClick={() => onSendToCritic(result)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/70 text-xs font-medium transition-colors self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluate with Critic</span>
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-serif italic">
              "{result.synthesizedNovelInsight}"
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
              <span>Seed Anchor: <strong className="text-white">{result.seedConcept}</strong></span>
              <span>·</span>
              <span>Surprise Peak: <strong className="text-pink-400">{result.peakSurpriseConcept}</strong></span>
            </div>
          </div>

          {/* Stepper Concept Chain */}
          <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold">
                Latent Trajectory Path ({result.trajectory.length} Transitions)
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Click any step to inspect Curiosity RL metrics
              </span>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {result.trajectory.map((node) => {
                const isSelected = selectedStep === node.step;
                return (
                  <button
                    key={node.step}
                    onClick={() => setSelectedStep(node.step)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all shrink-0 ${
                      isSelected
                        ? 'border-pink-500 bg-pink-950/40 text-pink-200 shadow-md ring-1 ring-pink-500'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono">
                      {node.step}
                    </span>
                    <span className="font-medium text-white">{node.concept}</span>
                    {node.isSurprisePeak && (
                      <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-pink-500 text-slate-950 font-bold uppercase">
                        Peak
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Detailed Selected Step Card */}
            {activeNode && (
              <div className="border border-slate-800 bg-slate-900/60 rounded-lg p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Step {activeNode.step}: "{activeNode.concept}"</span>
                    {activeNode.isSurprisePeak && (
                      <span className="text-xs font-mono text-pink-400 bg-pink-950/60 border border-pink-800/80 px-2 py-0.5 rounded flex items-center gap-1">
                        <Flag className="w-3 h-3 text-pink-400" />
                        <span>Curiosity Surprise Peak</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Latent Distance: <span className="text-cyan-400 font-semibold">{activeNode.latentDistance.toFixed(3)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic">
                  <strong>Association Mechanism:</strong> {activeNode.associationReason}
                </p>

                {/* Curiosity RL Metrics (Novelty * Coherence * Surprise) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="border border-slate-800 bg-slate-950 p-2.5 rounded-lg">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Novelty</div>
                    <div className="text-sm font-bold text-sky-400 mt-0.5 font-mono">
                      {(activeNode.noveltyScore * 10).toFixed(1)} / 10
                    </div>
                  </div>

                  <div className="border border-slate-800 bg-slate-950 p-2.5 rounded-lg">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Coherence</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">
                      {(activeNode.coherenceScore * 10).toFixed(1)} / 10
                    </div>
                  </div>

                  <div className="border border-slate-800 bg-slate-950 p-2.5 rounded-lg">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Surprise</div>
                    <div className="text-sm font-bold text-pink-400 mt-0.5 font-mono">
                      {(activeNode.surpriseScore * 10).toFixed(1)} / 10
                    </div>
                  </div>

                  <div className="border border-pink-900/50 bg-pink-950/20 p-2.5 rounded-lg">
                    <div className="text-[10px] font-mono text-pink-300 uppercase">RL Total Reward</div>
                    <div className="text-sm font-bold text-pink-300 mt-0.5 font-mono">
                      {activeNode.overallReward.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
