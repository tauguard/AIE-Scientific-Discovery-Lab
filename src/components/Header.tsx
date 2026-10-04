import React from 'react';
import { 
  Sparkles, 
  GitFork, 
  Layers, 
  Activity, 
  Sliders, 
  BookOpen, 
  Volume2, 
  Award, 
  ShieldCheck, 
  Compass, 
  Radio,
  FlaskConical
} from 'lucide-react';
import { EngineMode } from '../types/aie';

interface HeaderProps {
  currentMode: EngineMode;
  onSelectMode: (mode: EngineMode) => void;
  activeRelaxationCount: number;
  ckgCount: number;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  activeRelaxationCount,
  ckgCount,
  audioEnabled,
  onToggleAudio,
}) => {
  const navItems: { id: EngineMode; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Architecture & Invariants', icon: <Layers className="w-4 h-4" /> },
    { id: 'discovery', label: 'Scientific Discovery', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'counterfactual', label: 'Counterfactual SCM', icon: <GitFork className="w-4 h-4" /> },
    { id: 'blender', label: 'Conceptual Blender', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'dream', label: 'Free Association (Dream)', icon: <Activity className="w-4 h-4" /> },
    { id: 'constraints', label: 'Constraint Relaxation', icon: <Sliders className="w-4 h-4" /> },
    { id: 'narrative', label: 'Scenario Constructor', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'synesthesia', label: 'Synesthesia Studio', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'critic', label: 'The Critic (Evaluator)', icon: <Compass className="w-4 h-4" /> },
    { id: 'self-play', label: 'Self-Play Arena', icon: <Radio className="w-4 h-4" /> },
    { id: 'ckg-audit', label: 'CKG Audit Log', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'compliance', label: 'AIE Compliance', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand & Thesis */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/30">
              <span className="font-bold text-white text-lg tracking-tighter">∞</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Artificial Imagination Engine
                </h1>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                  v1.0
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  · IFA Core v1.0 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1 italic">
                “Imagination = Structured extrapolation beyond known data, guided by curiosity, coherence, and affect.”
              </p>
            </div>
          </div>

          {/* Quick Metrics & Controls (Unboxed, clean metadata) */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-800/60 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-cyan-400 font-semibold font-mono">Live Gemini Engine:</span>
              <span className="font-mono text-cyan-200">Active</span>
            </div>

            <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>

            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">IFA Core:</span>
              <span className="font-mono text-emerald-400 font-semibold">Active</span>
            </div>

            <span className="text-slate-700" aria-hidden="true">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Relaxations:</span>
              <span className="font-mono text-amber-400 font-semibold">{activeRelaxationCount}</span>
            </div>

            <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>

            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-slate-400">CKG Records:</span>
              <span className="font-mono text-cyan-400 font-semibold">{ckgCount}</span>
            </div>

            <span className="text-slate-700" aria-hidden="true">|</span>

            <button
              onClick={onToggleAudio}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors border ${
                audioEnabled 
                  ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300 hover:bg-cyan-900/60' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Web Audio Synesthesia synthesis"
            >
              <Volume2 className={`w-3.5 h-3.5 ${audioEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{audioEnabled ? 'Audio Synth ON' : 'Audio Synth Muted'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Functional segmented buttons) */}
        <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 pt-1 border-t border-slate-800/80 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectMode(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
