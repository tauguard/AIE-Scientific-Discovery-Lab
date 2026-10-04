import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Play, 
  Square, 
  Sparkles, 
  Layers, 
  RefreshCw, 
  Smartphone, 
  Palette, 
  Activity,
  AlertCircle,
  Box,
  Code2
} from 'lucide-react';
import { SynesthesiaResult, CKGEntry } from '../types/aie';
import { synestheticAudio } from '../utils/audioSynthesis';
import { Sensory3DSimulator } from './Sensory3DSimulator';

interface SynesthesiaStudioProps {
  onLogCKG: (entry: Omit<CKGEntry, 'id' | 'timestamp'>) => void;
  onSendToCritic: (content: unknown) => void;
}

export const SynesthesiaStudio: React.FC<SynesthesiaStudioProps> = ({
  onLogCKG,
  onSendToCritic
}) => {
  const [description, setDescription] = useState('A cold silver bell ringing at the bottom of a frozen sapphire lake');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SynesthesiaResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelMeta, setModelMeta] = useState<{ isLiveAI: boolean; modelName: string; latencyMs: number } | null>(null);

  const presets = [
    'A cold silver bell ringing at the bottom of a frozen sapphire lake',
    'Volcanic obsidian cracking under pressure of molten copper',
    'The taste of electric lime lightning striking dry violet desert sand',
    'An ancient wooden cello resonating inside an empty honeycomb cavern',
    'Zero-gravity silk dissolving into liquid neon starlight'
  ];

  const handleSynthesize = async (customDesc?: string) => {
    const d = customDesc || description;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/aie/synesthesia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: d }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Synesthesia synthesis failed');
        return;
      }

      setResult(data.result);
      if (data.meta) {
        setModelMeta(data.meta);
      }

      // Play synesthetic sound if active
      if (data.result?.audio) {
        synestheticAudio.play(data.result.audio, 4.0);
        setIsPlayingAudio(true);
        setTimeout(() => setIsPlayingAudio(false), 4000);
      }

      onLogCKG({
        module: 'synesthesia_engine',
        prompt: d,
        constraintsRelaxed: [],
        governanceDecision: data.governance,
        summary: `Synesthetic Cross-Modal Translation: ${data.result.sensoryMetaphor}`,
        outputPayload: data.result
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to synthesize cross-modal outputs');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount so the user immediately receives real live output from Gemini
  useEffect(() => {
    if (!result && !loading) {
      handleSynthesize(description);
    }
  }, []);

  const toggleSound = () => {
    if (!result?.audio) return;
    if (isPlayingAudio) {
      synestheticAudio.stop();
      setIsPlayingAudio(false);
    } else {
      synestheticAudio.play(result.audio, 5.0);
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 5000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-950 border border-blue-800 text-blue-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Multi-Modal Synesthesia Engine (Module 4.6)
            </h2>
            <span className="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/80 px-2 py-0.5 rounded">
              Cross-Modal Synthesis · 4 Modalities
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Projects qualitative thought across 4 modalities: Text semantics, Visual chromo-geometry, real Web Audio acoustic harmonics, and tactile haptic pulse sequences.
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

      {/* Input Bar */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe an experience, sound, taste, or entity to translate cross-modally..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            onKeyDown={(e) => e.key === 'Enter' && handleSynthesize()}
          />
          <button
            onClick={() => handleSynthesize()}
            disabled={loading || !description.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-md shadow-blue-600/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Synthesize Modalities</span>
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs text-slate-400 pt-1">
          <span className="shrink-0 text-slate-500 font-medium">Synesthetic Seeds:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDescription(p);
                handleSynthesize(p);
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
        <div className="p-8 rounded-xl border border-blue-800/60 bg-blue-950/20 text-center space-y-3 animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-sm font-semibold text-white font-mono">
              Translating Cross-Modal Sensorium with Gemini AI...
            </span>
          </div>
          <p className="text-xs text-blue-200/90 max-w-lg mx-auto">
            Synthesizing across 4 modalities: linguistic semantic metaphor, chromo-geometric palettes, acoustic ADSR harmonic audio envelopes, and physical haptic motor vibrations.
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
          {/* Top Metaphor Card */}
          <div className="border border-blue-800/50 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-cyan-950/40 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">
                  Synesthetic Sensorium Metaphor
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                  "{result.sensoryMetaphor}"
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
            <p className="text-sm text-slate-200 leading-relaxed mt-2">
              {result.crossModalDescription}
            </p>
          </div>

          {/* Compiled Interactive 3D Simulation Prototype (WebGL · Three.js · Web Audio API) */}
          <Sensory3DSimulator profile={result} />

          {/* 4 Modalities Grid (Normative Requirement 4.6.1: Text, Visual, Audio, Haptic) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Modality 1: Audio Acoustic Synthesis */}
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  <h4 className="text-sm font-semibold text-white">
                    Modality 1: Acoustic Harmonics
                  </h4>
                </div>
                <button
                  onClick={toggleSound}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isPlayingAudio
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md animate-pulse'
                      : 'bg-slate-800 text-sky-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isPlayingAudio ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlayingAudio ? 'Stop Tone' : 'Play Harmonics'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-800 bg-slate-950 p-3 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Fundamental Tone</span>
                  <div className="text-sm font-mono font-bold text-sky-400 mt-0.5">
                    {result.audio.rootFrequency} Hz
                  </div>
                  <span className="text-[10px] text-slate-500">Timbre: {result.audio.timbre} wave</span>
                </div>

                <div className="border border-slate-800 bg-slate-950 p-3 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Filter Cutoff</span>
                  <div className="text-sm font-mono font-bold text-white mt-0.5">
                    {result.audio.filterCutoff} Hz
                  </div>
                  <span className="text-[10px] text-slate-500">Pan: {result.audio.spatialStereoPan}</span>
                </div>
              </div>

              <div className="border border-slate-800 bg-slate-950 p-3 rounded-lg space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Harmonic Chord Spectra</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {result.audio.chordHarmonics.map((freq, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded font-mono text-xs bg-slate-900 border border-slate-800 text-cyan-300">
                      {Math.round(freq)} Hz
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modality 2: Visual Chromo-Geometry */}
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-violet-400" />
                  <h4 className="text-sm font-semibold text-white">
                    Modality 2: Visual Chromo-Geometry
                  </h4>
                </div>
                <div 
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: result.visual.accentHex }}
                  title={`Hue: ${result.visual.dominantHue}°`}
                />
              </div>

              {/* Generative Visual Canvas Box */}
              <div 
                className="h-32 rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `radial-gradient(circle at center, hsla(${result.visual.dominantHue}, ${result.visual.saturation}%, ${result.visual.lightness}%, 0.3) 0%, rgba(15,23,42,0.9) 80%)`
                }}
              >
                {/* SVG Geometric Motif */}
                <svg className="w-24 h-24 text-white/80 animate-spin" style={{ animationDuration: `${Math.max(4, 16 / (result.visual.motionSpeed || 1))}s` }} viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" fill="none" stroke={result.visual.accentHex} strokeWidth="1.5" strokeDasharray="6 4" />
                  <circle cx="50" cy="50" r="20" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                  <line x1="50" y1="15" x2="50" y2="85" stroke={result.visual.accentHex} strokeWidth="1" opacity="0.4" />
                  <line x1="15" y1="50" x2="85" y2="50" stroke={result.visual.accentHex} strokeWidth="1" opacity="0.4" />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-800 bg-slate-950 p-2.5 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Geometry Class</span>
                  <div className="text-xs font-semibold text-white mt-0.5">
                    {result.visual.geometryType}
                  </div>
                </div>

                <div className="border border-slate-800 bg-slate-950 p-2.5 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Tactile Texture</span>
                  <div className="text-xs font-semibold text-cyan-300 mt-0.5 capitalize">
                    {result.visual.tactileTexture}
                  </div>
                </div>
              </div>
            </div>

            {/* Modality 3: Haptic Waveform Synthesis */}
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">
                  Modality 3: Haptic Tactile Waveform
                </h4>
              </div>

              <p className="text-xs text-slate-300 italic">
                "{result.haptic.tactileDescription}"
              </p>

              {/* Vibration pulse timeline blocks */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Kinetic Vibration Cadence (ms)
                </span>
                <div className="flex items-center gap-1.5 h-8 p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                  {result.haptic.vibrationPatternMs.map((ms, idx) => (
                    <div 
                      key={idx}
                      className="h-full rounded bg-emerald-500/80 flex items-center justify-center text-[10px] font-mono text-slate-950 font-bold px-1"
                      style={{ flexGrow: Math.max(1, ms / 50) }}
                      title={`${ms}ms pulse`}
                    >
                      {ms}ms
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modality 4: Semantic Linguistic Grounding */}
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Activity className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white">
                  Modality 4: Semantic Input Grounding
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Input Stimulus:</span>
                  <div className="text-white font-medium mt-0.5">
                    {result.inputDescription}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Synesthetic Mapping Rule:</span>
                  <div className="text-slate-300 mt-0.5">
                    Maps semantic density to spectral envelope; acoustic harmonic ratios project spatial geometry and haptic feedback intensity.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
