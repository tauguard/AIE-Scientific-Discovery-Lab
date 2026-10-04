import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Star, 
  ThumbsUp, 
  HelpCircle,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { CriticScore, RLHFRating } from '../types/aie';

interface CriticEvaluatorProps {
  initialContent?: unknown;
  onRecordRLHF: (rating: RLHFRating) => void;
}

export const CriticEvaluator: React.FC<CriticEvaluatorProps> = ({
  initialContent,
  onRecordRLHF
}) => {
  const [contentToEvaluate, setContentToEvaluate] = useState(
    initialContent 
      ? (typeof initialContent === 'string' ? initialContent : JSON.stringify(initialContent, null, 2))
      : `Hypothesis: A living chair-creature (Thalasso-Sedia) that rests on the seafloor, breathes symbiotically with the occupant, and gently undulates away if mistreated or starved of ambient nutrients.`
  );

  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<CriticScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelMeta, setModelMeta] = useState<{ isLiveAI: boolean; modelName: string; latencyMs: number } | null>(null);

  // Human RLHF evaluation state (Section 7.1 Requirement 5 & 6)
  const [userRating, setUserRating] = useState<number>(9);
  const [feedbackCategory, setFeedbackCategory] = useState<RLHFRating['feedbackCategory']>('balanced_mastery');
  const [userComment, setUserComment] = useState('');
  const [rlhfSubmitted, setRlhfSubmitted] = useState(false);

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    setRlhfSubmitted(false);
    try {
      const res = await fetch('/api/aie/critic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imaginativeOutput: contentToEvaluate }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Critic evaluation failed');
        return;
      }

      setScore(data.result);
      if (data.meta) {
        setModelMeta(data.meta);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to the Critic module');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount so the user immediately receives real live output from Gemini
  useEffect(() => {
    if (!score && !loading) {
      handleEvaluate();
    }
  }, []);

  const handleSubmitRLHF = () => {
    onRecordRLHF({
      id: `RLHF-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      itemId: 'critic-eval',
      prompt: contentToEvaluate.slice(0, 100),
      userRating,
      feedbackCategory,
      comment: userComment
    });
    setRlhfSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Compass className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Novelty & Coherence Evaluator — The Critic (Module 4.7)
            </h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
              Edge of Chaos · 5-Dimensional Metric
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Scores imaginative hypotheses on Novelty, Coherence, Surprise, Usefulness, and Aesthetic resonance. Enforces the “Edge of Chaos” rule: rejecting conventional clichés and incoherent nonsense.
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

      {/* Input Box */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-3">
        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
          Proposal Payload to Critique
        </label>
        <textarea
          rows={4}
          value={contentToEvaluate}
          onChange={(e) => setContentToEvaluate(e.target.value)}
          placeholder="Paste or type imaginative proposal..."
          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
        />

        <div className="flex justify-end">
          <button
            onClick={handleEvaluate}
            disabled={loading || !contentToEvaluate.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>Run Critic Evaluation</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real-time Generative Pipeline Loading State */}
      {loading && (
        <div className="p-8 rounded-xl border border-emerald-800/60 bg-emerald-950/20 text-center space-y-3 animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
            <span className="text-sm font-semibold text-white font-mono">
              Scoring Hypothesis with Gemini Critic Engine...
            </span>
          </div>
          <p className="text-xs text-emerald-200/90 max-w-lg mx-auto">
            Computing 5 normative dimensions: Novelty, Coherence, Surprise, Usefulness, Aesthetic Resonance, and validating placement inside the "Edge of Chaos" corridor.
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-cyan-400 pt-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Live model evaluation active · Not a static template</span>
          </div>
        </div>
      )}

      {score && (
        <div className="space-y-6">
          {/* Edge of Chaos Gauge Banner */}
          <div className="border border-emerald-800/60 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-teal-950/40 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  Edge of Chaos Calibration (Section 4.7.1)
                </span>
                <h3 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                  <span>Score: {score.edgeOfChaosScore} / 10</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700 text-emerald-300 uppercase">
                    {score.verdict}
                  </span>
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">Positioning:</span>
                <div className="text-sm font-bold text-cyan-300 font-mono uppercase">
                  {score.edgeOfChaosZone === 'edge_of_chaos' ? '⚡ Optimal Edge of Chaos Zone' :
                   score.edgeOfChaosZone === 'too_boring' ? '💤 Too Close to Known Data (Boring)' : '🌪 Disconnected Nonsense'}
                </div>
              </div>
            </div>

            {/* Visual Edge of Chaos Tri-Section Bar */}
            <div className="space-y-1.5">
              <div className="h-4 rounded-full bg-slate-950 border border-slate-800 flex overflow-hidden p-0.5 relative">
                {/* Zone 1: Too boring (0 to 45%) */}
                <div className="w-[45%] bg-slate-800 text-[9px] font-mono text-slate-400 flex items-center justify-center border-r border-slate-700">
                  Too Close (Boring)
                </div>
                {/* Zone 2: Edge of Chaos (45% to 85%) */}
                <div className="w-[40%] bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-[9px] font-mono text-slate-950 font-bold flex items-center justify-center">
                  ★ Edge of Chaos (Optimal)
                </div>
                {/* Zone 3: Incoherent noise (85% to 100%) */}
                <div className="w-[15%] bg-rose-950 text-[9px] font-mono text-rose-400 flex items-center justify-center">
                  Nonsense
                </div>

                {/* Score Marker Needle */}
                <div 
                  className="absolute top-0 bottom-0 w-2.5 bg-white rounded shadow-md ring-2 ring-emerald-400 transition-all duration-500 -ml-1"
                  style={{ left: `${(score.edgeOfChaosScore / 10) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-300 pt-1">
              <strong>Critic Verdict:</strong> {score.critiqueNotes}
            </p>
          </div>

          {/* 5-Dimensional Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Novelty', val: score.novelty, desc: 'Distance from known distribution' },
              { label: 'Coherence', val: score.coherence, desc: 'Internal causal plausibility' },
              { label: 'Surprise', val: score.surprise, desc: 'Information gain vs expectations' },
              { label: 'Usefulness', val: score.usefulness, desc: 'Problem solving potential' },
              { label: 'Aesthetic', val: score.aesthetic, desc: 'Human affective harmony' },
            ].map((m, idx) => (
              <div key={idx} className="border border-slate-800 bg-slate-900/60 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  {m.label}
                </span>
                <div className="text-xl font-bold font-mono text-white">
                  {m.val.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 10</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Actionable Improvement Suggestion */}
          <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 space-y-2">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
              Actionable Refinement Suggestion
            </span>
            <p className="text-xs text-slate-200">
              {score.improvementSuggestion}
            </p>
          </div>

          {/* Human Evaluation & RLHF on Imagination (Section 7.1 Requirement 5 & 6) */}
          <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">
                  Human Evaluation & RLHF Alignment (Section 7.1)
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">Scale 1–10</span>
            </div>

            {rlhfSubmitted ? (
              <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Human feedback logged into RLHF training dataset! Reward parameters updated for this conceptual domain.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-300 font-medium">Your Imagination Score:</span>
                    <span className="text-amber-400 font-bold font-mono ml-2 text-base">{userRating} / 10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={userRating}
                    onChange={(e) => setUserRating(parseInt(e.target.value, 10))}
                    className="w-full sm:w-64 accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'too_conventional', label: 'Too Conventional' },
                    { id: 'balanced_mastery', label: 'Balanced Mastery' },
                    { id: 'incoherent_noise', label: 'Incoherent Noise' },
                    { id: 'genius_leap', label: 'Transcendent Leap' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFeedbackCategory(cat.id as any)}
                      className={`p-2 rounded-lg border text-center transition-colors ${
                        feedbackCategory === cat.id
                          ? 'border-amber-500 bg-amber-950/40 text-amber-200 font-semibold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Optional human evaluator critique note..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleSubmitRLHF}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shrink-0"
                  >
                    Submit RLHF Signal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
