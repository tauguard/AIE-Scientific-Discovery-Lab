import React from 'react';
import { 
  Sliders, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock,
  Activity,
  Layers
} from 'lucide-react';
import { RelaxedConstraint } from '../types/aie';

interface ConstraintMatrixProps {
  constraints: RelaxedConstraint[];
  onToggleConstraint: (type: RelaxedConstraint['type']) => void;
  onUpdateDegree: (type: RelaxedConstraint['type'], degree: number) => void;
  onResetAll: () => void;
}

export const ConstraintMatrix: React.FC<ConstraintMatrixProps> = ({
  constraints,
  onToggleConstraint,
  onUpdateDegree,
  onResetAll
}) => {
  const activeCount = constraints.filter(c => c.active).length;
  // Calculate stability index: starts at 100%, drops as more constraints are heavily relaxed
  const totalRelaxationSum = constraints.reduce((acc, c) => acc + (c.active ? c.relaxationDegree : 0), 0);
  const systemStability = Math.max(15, 100 - Math.round(totalRelaxationSum * 0.14));

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-amber-950 border border-amber-800 text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Constraint Relaxation Engine (Module 4.4)
            </h2>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
              Structural Invariant Suspension
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Temporarily suspends structural rules of physical and logical reality. Ensures reversibility and coherence restoration while safeguarding non-negotiable ethical invariants.
          </p>
        </div>

        {activeCount > 0 && (
          <button
            onClick={onResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Standard Reality</span>
          </button>
        )}
      </div>

      {/* Stability & Reversibility Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Suspension Depth</span>
            <span className="text-xs font-mono text-amber-400 font-bold">{activeCount} / {constraints.length} Relaxed</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${(activeCount / constraints.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">System Coherence Stability</span>
            <span className={`text-xs font-mono font-bold ${
              systemStability > 70 ? 'text-emerald-400' :
              systemStability > 40 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {systemStability}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className={`h-full transition-all duration-300 ${
                systemStability > 70 ? 'bg-emerald-500' :
                systemStability > 40 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${systemStability}%` }}
            />
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-mono text-slate-400 uppercase">Reversibility Lock</span>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Reversible State</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Constraints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {constraints.map((c) => {
          return (
            <div
              key={c.type}
              className={`border rounded-xl p-5 transition-all ${
                c.active
                  ? 'border-amber-500/70 bg-amber-950/20 shadow-md ring-1 ring-amber-500/30'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase text-amber-400 font-semibold">
                      {c.type}
                    </span>
                    {c.safetyLock && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.2 rounded">
                        Safety Bound
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {c.description}
                  </p>
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => onToggleConstraint(c.type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 border ${
                    c.active
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {c.active ? 'Relaxed' : 'Rigid'}
                </button>
              </div>

              {/* Slider & Spec Example */}
              {c.active && (
                <div className="mt-4 pt-3 border-t border-amber-800/40 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Relaxation Degree:</span>
                      <span className="text-amber-400 font-bold">{c.relaxationDegree}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={c.relaxationDegree}
                      onChange={(e) => onUpdateDegree(c.type, parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 italic">
                    <span className="text-slate-500 not-italic font-mono text-[10px] uppercase block">
                      Normative Spec Example:
                    </span>
                    "{c.promptModifier}"
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Governance Safety Invariant Note (Section 4.4.3) */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex items-start gap-3 text-xs text-slate-300">
        <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-white">Section 4.4.3 Compliance Guarantee</div>
          <p>
            Constraint relaxation is strictly sandboxed. The Deterministic Core (IFA v1.0) permanently forbids relaxing constraints that would breach structural invariants protecting physical safety, human rights, or societal stability.
          </p>
        </div>
      </div>
    </div>
  );
};
