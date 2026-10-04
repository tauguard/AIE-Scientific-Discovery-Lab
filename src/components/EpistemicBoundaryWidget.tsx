import React, { useState } from 'react';
import { 
  Scale, 
  Layers, 
  Eye, 
  Info, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Filter
} from 'lucide-react';
import { EpistemicLevel, EpistemicSection } from '../types/aie';

interface EpistemicBoundaryWidgetProps {
  sections: EpistemicSection[];
  activeFilter: EpistemicLevel | 'ALL';
  onSelectFilter: (filter: EpistemicLevel | 'ALL') => void;
  className?: string;
  compact?: boolean;
}

export const EPISTEMIC_LEVEL_CONFIG: Record<EpistemicLevel, {
  label: string;
  badge: string;
  depth: number;
  colorBorder: string;
  colorBg: string;
  colorText: string;
  colorAccent: string;
  description: string;
}> = {
  'FORMAL': {
    label: 'Formal Intervention',
    badge: 'FORMAL (Depth 0)',
    depth: 0,
    colorBorder: 'border-sky-700/80',
    colorBg: 'bg-sky-950/40',
    colorText: 'text-sky-300',
    colorAccent: '#38bdf8',
    description: 'Exact parameter modified in the Structural Causal Model via the Pearl do(X=x\') operator.'
  },
  'SCM-DERIVED': {
    label: 'SCM-Derived Law',
    badge: 'SCM-DERIVED (Depth 1)',
    depth: 1,
    colorBorder: 'border-emerald-700/80',
    colorBg: 'bg-emerald-950/40',
    colorText: 'text-emerald-300',
    colorAccent: '#34d399',
    description: 'Direct causal consequences mathematically or physically required by the model\'s structural DAG equations.'
  },
  'MODEL-DEPENDENT': {
    label: 'Model-Dependent Rules',
    badge: 'MODEL-DEPENDENT (Depth 2)',
    depth: 2,
    colorBorder: 'border-amber-700/80',
    colorBg: 'bg-amber-950/40',
    colorText: 'text-amber-300',
    colorAccent: '#fbbf24',
    description: 'Consequences contingent on intermediate biological, ecological, or physical domain transition models.'
  },
  'SPECULATIVE EXTRAPOLATION': {
    label: 'Speculative Extrapolation',
    badge: 'SPECULATIVE EXTRAPOLATION (Depth 3)',
    depth: 3,
    colorBorder: 'border-violet-700/80',
    colorBg: 'bg-violet-950/40',
    colorText: 'text-violet-300',
    colorAccent: '#a78bfa',
    description: 'Consequences extending beyond the explicitly modeled graph into human culture, architecture, and technology.'
  },
  'NARRATIVE SYNTHESIS': {
    label: 'Narrative Synthesis',
    badge: 'NARRATIVE SYNTHESIS (Depth 4)',
    depth: 4,
    colorBorder: 'border-pink-700/80',
    colorBg: 'bg-pink-950/40',
    colorText: 'text-pink-300',
    colorAccent: '#f472b6',
    description: 'Evocative literary language, emotional arcs, and metaphors expressing the resulting world state.'
  }
};

export const EpistemicBoundaryWidget: React.FC<EpistemicBoundaryWidgetProps> = ({
  sections,
  activeFilter,
  onSelectFilter,
  className = '',
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Calculate distribution by level
  const total = sections.length || 1;
  const counts: Record<EpistemicLevel, number> = {
    'FORMAL': sections.filter(s => s.level === 'FORMAL').length,
    'SCM-DERIVED': sections.filter(s => s.level === 'SCM-DERIVED').length,
    'MODEL-DEPENDENT': sections.filter(s => s.level === 'MODEL-DEPENDENT').length,
    'SPECULATIVE EXTRAPOLATION': sections.filter(s => s.level === 'SPECULATIVE EXTRAPOLATION').length,
    'NARRATIVE SYNTHESIS': sections.filter(s => s.level === 'NARRATIVE SYNTHESIS').length,
  };

  const levels: EpistemicLevel[] = [
    'FORMAL',
    'SCM-DERIVED',
    'MODEL-DEPENDENT',
    'SPECULATIVE EXTRAPOLATION',
    'NARRATIVE SYNTHESIS'
  ];

  return (
    <div className={`border border-cyan-900/60 bg-slate-950/90 rounded-xl p-4 shadow-lg backdrop-blur-md transition-all ${className}`}>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span>Persistent Epistemic Boundary Widget</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-1.5 py-0.2 rounded font-normal">
                Audited Status
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Programmatically tags generated text by causal generation depth (Depth 0 → 4)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Interactive Filter Reset */}
          {activeFilter !== 'ALL' && (
            <button
              onClick={() => onSelectFilter('ALL')}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors mr-1"
            >
              Show All ({sections.length})
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isExpanded ? 'Collapse Widget' : 'Expand Widget'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Epistemic Spectrum Bar */}
      <div className="py-3 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Epistemic Generation Depth Spectrum</span>
          <span>{sections.length} Tagged Sections</span>
        </div>

        <div className="h-2.5 rounded-full bg-slate-900 border border-slate-800 flex overflow-hidden p-0.5 gap-0.5">
          {levels.map((lvl) => {
            const count = counts[lvl];
            const pct = (count / total) * 100;
            if (count === 0) return null;
            const config = EPISTEMIC_LEVEL_CONFIG[lvl];

            return (
              <div
                key={lvl}
                className="h-full rounded-sm transition-all duration-300 cursor-pointer"
                style={{
                  width: `${pct}%`,
                  backgroundColor: config.colorAccent,
                  opacity: activeFilter === 'ALL' || activeFilter === lvl ? 1 : 0.25
                }}
                onClick={() => onSelectFilter(activeFilter === lvl ? 'ALL' : lvl)}
                title={`${config.label}: ${count} section(s) (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Interactive Level Segmented Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
        <button
          onClick={() => onSelectFilter('ALL')}
          className={`px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-colors border ${
            activeFilter === 'ALL'
              ? 'bg-slate-800 border-slate-700 text-white font-bold'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Depths ({sections.length})
        </button>

        {levels.map((lvl) => {
          const config = EPISTEMIC_LEVEL_CONFIG[lvl];
          const count = counts[lvl];
          const isActive = activeFilter === lvl;

          return (
            <button
              key={lvl}
              onClick={() => onSelectFilter(isActive ? 'ALL' : lvl)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-all border ${
                isActive
                  ? `${config.colorBg} ${config.colorBorder} ${config.colorText} font-bold ring-1 ring-current`
                  : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.colorAccent }} />
              <span>{lvl}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Expanded Reference Guide */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[11px]">
          {levels.map((lvl) => {
            const config = EPISTEMIC_LEVEL_CONFIG[lvl];
            const isSelected = activeFilter === lvl;

            return (
              <div
                key={lvl}
                onClick={() => onSelectFilter(isSelected ? 'ALL' : lvl)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-colors space-y-1 ${
                  isSelected
                    ? `${config.colorBg} ${config.colorBorder}`
                    : 'bg-slate-900/40 border-slate-800/70 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] font-bold ${config.colorText}`}>
                    Depth {config.depth}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {counts[lvl]} block{counts[lvl] === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="font-semibold text-slate-200 text-xs">
                  {config.label}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {config.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
