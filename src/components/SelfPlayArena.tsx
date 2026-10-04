import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Play, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { SelfPlayResult, CKGEntry } from '../types/aie';

interface SelfPlayArenaProps {
  onLogCKG: (entry: Omit<CKGEntry, 'id' | 'timestamp'>) => void;
  onSendToCritic: (content: unknown) => void;
}

export const SelfPlayArena: React.FC<SelfPlayArenaProps> = ({
  onLogCKG,
  onSendToCritic
}) => {
  const [prompt, setPrompt] = useState('Devise a zero-emission engine that operates on spatial topology rather than combustion or electrochemical storage');
  const [rounds, setRounds] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SelfPlayResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelMeta, setModelMeta] = useState<{ isLiveAI: boolean; modelName: string; latencyMs: number } | null>(null);

  const presets = [
    'Devise a zero-emission engine that operates on spatial topology rather than combustion or electrochemical storage',
    'Conceive a planetary architecture that accommodates 50 billion humans without displacing wild biosphere ecosystems',
    'Design an operating system where memory registers are non-local quantum entanglements rather than binary silicon gates'
  ];

  const handleRunSelfPlay = async (customPrompt?: string) => {
    const p = customPrompt || prompt;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/aie/self-play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p, rounds }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Self-play execution halted');
        return;
      }

      setResult(data.result);
      if (data.meta) {
        setModelMeta(data.meta);
      }

      onLogCKG({
        module: 'self_play_arena',
        prompt: p,
        constraintsRelaxed: [],
        governanceDecision: data.governance,
        summary: `Self-Play Arena completed ${rounds} refinement cycles (+${data.result.totalGainNovelty} Novelty)`,
        outputPayload: data.result
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to self-play engine');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount so the user immediately receives real live output from Gemini
  useEffect(() => {
    if (!result && !loading) {
      handleRunSelfPlay(prompt);
    }
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-400">
              <Radio className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Self-Play Imagination Arena (Phase 5)
            </h2>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/80 px-2 py-0.5 rounded">
              Two-Agent RL Loop · AlphaGo Methodology
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulates iterative self-play games between the <strong>Imaginator</strong> (generative challenger) and <strong>The Critic</strong> (evaluative validator), driving ideas from raw speculative impulses into causally sound mastery.
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

      {/* Input Formulation */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Formulate imagination challenge for self-play agents..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            onKeyDown={(e) => e.key === 'Enter' && handleRunSelfPlay()}
          />
          <button
            onClick={() => handleRunSelfPlay()}
            disabled={loading || !prompt.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>Initiate Self-Play Loop</span>
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs text-slate-400 pt-1">
          <span className="shrink-0 text-slate-500 font-medium">Challenges:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(p);
                handleRunSelfPlay(p);
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              {p.slice(0, 48)}...
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
        <div className="p-8 rounded-xl border border-indigo-800/60 bg-indigo-950/20 text-center space-y-3 animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
            <span className="text-sm font-semibold text-white font-mono">
              Running Dual-Agent Imagination Self-Play with Gemini AI...
            </span>
          </div>
          <p className="text-xs text-indigo-200/90 max-w-lg mx-auto">
            Simulating adversarial reinforcement dialogue between the <strong>Imaginator</strong> generating boundary-pushing solutions and <strong>The Critic</strong> auditing causal vulnerabilities and calculating delta gains.
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-cyan-400 pt-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Live dual-agent loop active · Not a static template</span>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Performance Gain Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Self-Play Rounds</span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {result.iterations.length} Cycles Completed
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4">
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Delta Novelty Gain</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                +{result.totalGainNovelty.toFixed(1)} Pts
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4">
              <span className="text-[10px] font-mono text-sky-400 uppercase">Delta Coherence Gain</span>
              <div className="text-xl font-bold font-mono text-sky-400 mt-1">
                +{result.totalGainCoherence.toFixed(1)} Pts
              </div>
            </div>
          </div>

          {/* Iteration Exchange Cards */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Dialectical Self-Play Rounds
            </h4>

            {result.iterations.map((iter) => (
              <div
                key={iter.round}
                className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-indigo-400 font-bold uppercase">
                      Round {iter.round}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-300 font-mono">
                      Verdict: <strong className="text-emerald-400">{iter.criticScore.verdict}</strong>
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Edge of Chaos Score: <strong className="text-cyan-400">{iter.criticScore.edgeOfChaosScore} / 10</strong>
                  </div>
                </div>

                {/* Imaginator Proposal */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-purple-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Agent 1 (Imaginator Proposal):</span>
                  </div>
                  <p className="text-sm text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {iter.imaginatorProposal}
                  </p>
                </div>

                {/* Critic Feedback */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Agent 2 (Critic Evaluation):</span>
                  </div>
                  <p className="text-xs text-slate-300 bg-amber-950/20 p-3 rounded-lg border border-amber-900/40 italic">
                    "{iter.criticFeedback}"
                  </p>
                </div>

                {/* Refined Hypothesis */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
                    Refined Dialectical Hypothesis:
                  </span>
                  <div className="text-xs text-emerald-200 font-medium">
                    {iter.refinedHypothesis}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final Synthesis Card */}
          <div className="border border-indigo-800/60 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-purple-950/40 rounded-xl p-6 space-y-2">
            <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
              Final Convergence Synthesis
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed">
              {result.finalSynthesis}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
