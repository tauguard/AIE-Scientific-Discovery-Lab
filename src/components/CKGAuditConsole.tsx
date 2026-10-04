import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  History,
  Lock,
  ExternalLink
} from 'lucide-react';
import { CKGEntry } from '../types/aie';

interface CKGAuditConsoleProps {
  entries: CKGEntry[];
  onTriggerRefusalTest: () => void;
}

export const CKGAuditConsole: React.FC<CKGAuditConsoleProps> = ({
  entries,
  onTriggerRefusalTest
}) => {
  const [filter, setFilter] = useState<'all' | 'authorized' | 'refused'>('all');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(entries[0]?.id || null);

  const filteredEntries = entries.filter(e => {
    if (filter === 'authorized') return e.governanceDecision.outcome === 'AUTHORIZED';
    if (filter === 'refused') return e.governanceDecision.outcome === 'REFUSED';
    return true;
  });

  const selectedEntry = entries.find(e => e.id === selectedEntryId);

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AIE_v1_CKG_Audit_Trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Canonical Knowledge Graph (CKG) & IFA Governance (Section 6)
            </h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
              IFA Core v1.0 Auditable Trace
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable decision log verified by the Deterministic Core. Enforces Authority Separation, purpose invariants, and terminal refusal logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerRefusalTest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold transition-colors"
            title="Simulate a structural invariant breach to verify Section 6.4 Auditable Refusal"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Test Invariant Refusal</span>
          </button>

          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CKG Ledger</span>
          </button>
        </div>
      </div>

      {/* IFA Core Operational Invariants Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: 'Safety Invariant', status: 'Non-Negotiable', ref: 'Section 6.1 (1)' },
          { label: 'Ethical Protection', status: 'Enforced', ref: 'Section 6.1 (2)' },
          { label: 'Authority Separation', status: 'Deterministic Core Only', ref: 'Section 6.3' },
          { label: 'Auditable Trace', status: '100% Logged in CKG', ref: 'Section 6.4' },
        ].map((inv, idx) => (
          <div key={idx} className="border border-slate-800 bg-slate-900/60 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              {inv.label}
            </span>
            <div className="text-xs font-bold text-cyan-300 font-mono">
              {inv.status}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">
              {inv.ref}
            </span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
        {(['all', 'authorized', 'refused'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === mode
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {mode} Records ({
              mode === 'all' ? entries.length :
              mode === 'authorized' ? entries.filter(e => e.governanceDecision.outcome === 'AUTHORIZED').length :
              entries.filter(e => e.governanceDecision.outcome === 'REFUSED').length
            })
          </button>
        ))}
      </div>

      {/* Ledger Table & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ledger List */}
        <div className="lg:col-span-6 space-y-2 max-h-[580px] overflow-y-auto pr-1">
          {filteredEntries.map((e) => {
            const isRefused = e.governanceDecision.outcome === 'REFUSED';
            const isSelected = selectedEntryId === e.id;

            return (
              <div
                key={e.id}
                onClick={() => setSelectedEntryId(e.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? isRefused
                      ? 'border-rose-500 bg-rose-950/20 ring-1 ring-rose-500'
                      : 'border-cyan-500 bg-slate-900 ring-1 ring-cyan-500'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-[11px] text-slate-400">{e.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isRefused ? 'bg-rose-950 border border-rose-800 text-rose-300' : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                  }`}>
                    {e.governanceDecision.outcome}
                  </span>
                </div>

                <div className="text-xs font-medium text-white line-clamp-1">
                  {e.prompt}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                  <span>Module: {e.module}</span>
                  <span>{new Date(e.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Record Details */}
        <div className="lg:col-span-6">
          {selectedEntry ? (
            <div className="border border-slate-800 bg-slate-900/80 rounded-xl p-5 space-y-4 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    CKG Transaction Record
                  </span>
                  <div className="font-mono text-sm font-bold text-white mt-0.5">
                    {selectedEntry.id}
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                  selectedEntry.governanceDecision.outcome === 'REFUSED'
                    ? 'bg-rose-950 border border-rose-800 text-rose-300'
                    : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                }`}>
                  {selectedEntry.governanceDecision.outcome}
                </div>
              </div>

              {/* Timestamp & Authority */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="font-mono text-slate-200">{selectedEntry.timestamp}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Authority:</span>
                  <span className="font-mono text-cyan-300">{selectedEntry.governanceDecision.authority}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Active Module:</span>
                  <span className="font-mono text-white">{selectedEntry.module}</span>
                </div>
                {selectedEntry.governanceDecision.violatedRule && (
                  <div className="flex justify-between py-1 border-b border-slate-800/60 text-rose-300 font-semibold">
                    <span>Violated Rule:</span>
                    <span className="font-mono">{selectedEntry.governanceDecision.violatedRule}</span>
                  </div>
                )}
              </div>

              {/* Proposed Action Prose */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Proposed Action:</span>
                <p className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono">
                  {selectedEntry.prompt}
                </p>
              </div>

              {/* IFA Core Decision Rationale */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Decision Explanation:</span>
                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {selectedEntry.governanceDecision.explanation}
                </p>
              </div>

              {/* Raw JSON Trace Snippet */}
              <div className="pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Canonical Graph Payload:
                </span>
                <pre className="text-[10px] font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 max-h-40 overflow-y-auto">
                  {JSON.stringify(selectedEntry.outputPayload || {}, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-8 text-center text-xs text-slate-400">
              Select an entry to view CKG decision trace
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
