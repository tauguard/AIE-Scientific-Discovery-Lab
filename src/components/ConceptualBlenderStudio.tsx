import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  RefreshCw, 
  ArrowRight, 
  Layers, 
  AlertCircle, 
  ShieldCheck,
  Zap,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scale,
  FileText
} from 'lucide-react';
import { ConceptualBlendResult, GovernanceDecision, CKGEntry, RelaxedConstraint, EmergenceStatus } from '../types/aie';

interface ConceptualBlenderStudioProps {
  relaxedConstraints: RelaxedConstraint[];
  onLogCKG: (entry: Omit<CKGEntry, 'id' | 'timestamp'>) => void;
  onSendToCritic: (content: unknown) => void;
}

export const ConceptualBlenderStudio: React.FC<ConceptualBlenderStudioProps> = ({
  relaxedConstraints,
  onLogCKG,
  onSendToCritic
}) => {
  const [conceptA, setConceptA] = useState('chair');
  const [conceptB, setConceptB] = useState('ocean');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConceptualBlendResult | null>(null);
  const [governance, setGovernance] = useState<GovernanceDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelMeta, setModelMeta] = useState<{ isLiveAI: boolean; modelName: string; latencyMs: number } | null>(null);

  const blendPresets = [
    { a: 'Human', b: 'Monkey' },
    { a: 'chair', b: 'ocean' },
    { a: 'clock', b: 'human heart' },
    { a: 'cloud', b: 'library' },
    { a: 'telescope', b: 'honeycomb' },
    { a: 'fire', b: 'mirror' }
  ];

  const handleBlend = async (customA?: string, customB?: string) => {
    const inputA = customA || conceptA;
    const inputB = customB || conceptB;
    setLoading(true);
    setError(null);
    try {
      const activeTypes = relaxedConstraints.filter(c => c.active).map(c => c.type);
      const res = await fetch('/api/aie/blend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptA: inputA, conceptB: inputB, relaxedConstraints: activeTypes }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGovernance(data.governance || null);
        setError(data.error || 'Blend refused by IFA Core Governance');
        return;
      }

      setGovernance(data.governance);
      setResult(data.result);
      if (data.meta) {
        setModelMeta(data.meta);
      }

      // Log to CKG
      onLogCKG({
        module: 'conceptual_blender',
        prompt: `${inputA} + ${inputB}`,
        constraintsRelaxed: activeTypes,
        governanceDecision: data.governance,
        summary: `Conceptual Blend: ${data.result.blendedConceptName}`,
        outputPayload: data.result
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to execute conceptual blend');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount so the user immediately receives real live output from Gemini
  useEffect(() => {
    if (!result && !loading) {
      handleBlend(conceptA, conceptB);
    }
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-violet-950 border border-violet-800 text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Conceptual Blender (Module 4.2)
            </h2>
            <span className="text-xs font-mono text-violet-400 bg-violet-950/60 border border-violet-800/80 px-2 py-0.5 rounded">
              Fauconnier & Turner Theory
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Combines two distinct conceptual domains through structural alignment (not surface level mashups) to project a novel blend space with emergent properties.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          {governance && (
            <div className="flex items-center gap-2 text-xs border border-emerald-800/50 bg-emerald-950/30 px-3 py-1.5 rounded-lg text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>IFA Core: {governance.outcome}</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Formulation */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Concept A (Domain 1)
            </label>
            <input
              type="text"
              value={conceptA}
              onChange={(e) => setConceptA(e.target.value)}
              placeholder="e.g. chair, cathedral, clock..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Concept B (Domain 2)
            </label>
            <input
              type="text"
              value={conceptB}
              onChange={(e) => setConceptB(e.target.value)}
              placeholder="e.g. ocean, thunderstorm, library..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs text-slate-400 w-full sm:w-auto">
            <span className="shrink-0 text-slate-500 font-medium">Pairs:</span>
            {blendPresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setConceptA(p.a);
                  setConceptB(p.b);
                  handleBlend(p.a, p.b);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              >
                {p.a} + {p.b}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleBlend()}
            disabled={loading || !conceptA.trim() || !conceptB.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-md shadow-violet-600/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Synthesize Blend Space</span>
          </button>
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
        <div className="p-8 rounded-xl border border-violet-800/60 bg-violet-950/20 text-center space-y-3 animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 text-violet-400 animate-spin" />
            <span className="text-sm font-semibold text-white font-mono">
              Synthesizing Conceptual Blend with Gemini AI...
            </span>
          </div>
          <p className="text-xs text-violet-200/90 max-w-lg mx-auto">
            Mapping functional, morphological, and dynamical components across distinct conceptual domains to project emergent blend properties according to Fauconnier & Turner's theory.
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-cyan-400 pt-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Live model synthesis active · Not a static template</span>
          </div>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Header Card for Blend Space */}
          <div className="border border-violet-800/60 bg-gradient-to-r from-violet-950/40 via-slate-900/60 to-purple-950/40 rounded-xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-violet-400">
                  <span>Domain A: {result.domainA}</span>
                  <span>↔</span>
                  <span>Domain B: {result.domainB}</span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                  {result.blendedConceptName}
                </h3>
              </div>
              <button
                onClick={() => onSendToCritic(result)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/70 text-xs font-medium transition-colors self-start md:self-auto"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Evaluate with Critic</span>
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed mt-3">
              {result.blendedDescription}
            </p>

            {/* Extracted Features of Source Spaces */}
            {(result.featuresA || result.featuresB) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 mt-3 border-t border-violet-800/40 text-xs">
                {result.featuresA && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-violet-300 uppercase tracking-wider block font-semibold">
                      Extracted Features · Space A ({result.conceptA}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {result.featuresA.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-900/80 border border-violet-900/60 text-slate-300 text-[11px]">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.featuresB && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider block font-semibold">
                      Extracted Features · Space B ({result.conceptB}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {result.featuresB.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-900/80 border border-cyan-900/60 text-slate-300 text-[11px]">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Blend Critic Emergence Audit Card (Section 4.2.2 Architectural Core) */}
          {result.blendCritic && (
            <div className="border border-violet-800/70 bg-violet-950/20 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-mono text-violet-300 font-bold uppercase tracking-wider">
                    Blend Critic Emergence Audit
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-violet-950 border border-violet-700/80 text-[11px] font-mono text-violet-300 font-semibold">
                    {result.blendCritic.formulaChecked || "Emergence = f(A_structure, B_structure, Mapping) verified"}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Structural Groundedness</span>
                  <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                    {typeof result.blendCritic.structuralGroundedness === 'number' 
                      ? `${(result.blendCritic.structuralGroundedness * 100).toFixed(0)}%` 
                      : 'Verified'}
                  </div>
                  <span className="text-[10px] text-slate-500">Derived from mapped interactions</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase block">Supported Emergence</span>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                    {result.blendCritic.supportedCount || result.emergentProperties.length} Properties
                  </div>
                  <span className="text-[10px] text-slate-500">Rigorous structural/functional blend</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-mono text-rose-400 uppercase block">Filtered Inventions</span>
                  <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
                    {result.blendCritic.rejectedCount || result.blendCritic.unsupportedAttributions?.length || 0} Rejected
                  </div>
                  <span className="text-[10px] text-slate-500">Arbitrary LLM hallucinations removed</span>
                </div>
              </div>

              {/* Rejected Claims Callout (Unsupported Blend Attributions) */}
              {result.blendCritic.unsupportedAttributions && result.blendCritic.unsupportedAttributions.length > 0 && (
                <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-300 font-mono text-xs font-semibold uppercase">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Audited & Rejected: Unsupported Blend Attributions</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    The Blend Critic rejected these candidate properties because no structural, functional, or morphological mapping established the relationship. They represent arbitrary LLM hallucinations rather than genuine structural emergence:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {result.blendCritic.unsupportedAttributions.map((attr, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300 bg-slate-900/80 px-2.5 py-1.5 rounded border border-rose-900/50">
                        <span className="text-rose-400 font-mono font-bold shrink-0">✕</span>
                        <span>{attr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Critic Audit Note */}
              <div className="text-xs text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                <span className="font-mono text-violet-400 font-semibold block text-[10px] uppercase mb-0.5">
                  Critic Evaluation Note:
                </span>
                {result.blendCritic.notes}
              </div>
            </div>
          )}

          {/* Emergence Provenance Table (Central Normative 4.2 Upgrade) */}
          {result.emergenceProvenance && result.emergenceProvenance.length > 0 && (
            <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    Emergence Provenance Ledger
                  </span>
                  <span className="text-xs text-slate-500">· Structural Derivation Audit</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {result.emergenceProvenance.length} Evaluated Attributions
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                      <th className="py-2.5 px-3 min-w-[180px]">Emergent Property</th>
                      <th className="py-2.5 px-3 min-w-[140px]">Source Mapping</th>
                      <th className="py-2.5 px-3 text-center min-w-[100px]">Derivation</th>
                      <th className="py-2.5 px-3 text-center min-w-[110px]">Status</th>
                      <th className="py-2.5 px-3 min-w-[240px]">Critic Audit Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {result.emergenceProvenance.map((item, idx) => {
                      const isRejected = item.status === 'REJECTED';
                      return (
                        <tr key={idx} className={`transition-colors ${isRejected ? 'bg-rose-950/15 opacity-80' : 'hover:bg-slate-900/40'}`}>
                          <td className="py-3 px-3 font-medium text-white">
                            <span className={isRejected ? 'line-through text-slate-400' : ''}>
                              {item.emergentProperty}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-violet-300">
                            {item.sourceMapping}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                              item.derivation === 'narrative invention' 
                                ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {item.derivation}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-block ${
                              item.status === 'SUPPORTED' ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' :
                              item.status === 'BLEND-DERIVED' ? 'bg-cyan-950 border border-cyan-700 text-cyan-300' :
                              item.status === 'MODEL-DEPENDENT' ? 'bg-amber-950 border border-amber-700 text-amber-300' :
                              'bg-rose-950 border border-rose-700 text-rose-300'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300 text-[11px] leading-relaxed">
                            {item.auditRationale}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Structural Mapping Table (Normative Requirement 4.2.1) */}
          <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider font-semibold">
                  Structural Alignment Table (Fauconnier & Turner)
                </span>
                <span className="text-xs text-slate-500">· Deep Mapping Matrix</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {result.structuralMappings.length} Isomorphic Alignments
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Element A ({result.conceptA})</th>
                    <th className="py-2.5 px-3 text-center">Mapping</th>
                    <th className="py-2.5 px-3">Element B ({result.conceptB})</th>
                    <th className="py-2.5 px-3">Emergent Blend Property</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {result.structuralMappings.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-white">{m.elementA}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950/80 border border-violet-800 text-violet-300 uppercase">
                          {m.mappingType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-cyan-300">{m.elementB}</td>
                      <td className="py-3 px-3 text-slate-300">{m.emergentProperty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Emergent Properties & Quirks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                Emergent Properties (Not In Parent Concepts)
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.emergentProperties.map((prop, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5">
                      ✓
                    </span>
                    <span>{prop}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                Unintended Anomalies & Dialectical Quirks
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.unintendedAnomalies.map((anomaly, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5">
                      !
                    </span>
                    <span>{anomaly}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Visual Metaphor Illustration Box */}
          <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-tr from-violet-600 via-sky-500 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/10 border border-violet-400/30">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Visual Metaphor Representation</span>
              <p className="text-sm italic text-slate-200">
                "{result.visualMetaphor}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
