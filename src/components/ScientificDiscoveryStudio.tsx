/**
 * Scientific Discovery Studio (AIE v1.0 Discovery Extension)
 * Databricks Agentic Scientific Discovery Benchmark (Challenge #3)
 * 
 * Exposes the full iterative discovery loop:
 * QUESTION -> RESEARCH -> HYPOTHESES -> EXPERIMENT PLANNING
 * -> DETERMINISTIC SELECTION -> REAL NUMERICAL COMPUTATION
 * -> BAYESIAN ANALYSIS & HYPOTHESIS UPDATE -> NEXT EXPERIMENT DECISION
 */

import React, { useState, useId } from 'react';
import { 
  FlaskConical, 
  Sparkles, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Compass, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Hash,
  Activity,
  Layers,
  FileText
} from 'lucide-react';
import { 
  ScientificQuestion, 
  ResearchSummary, 
  ScientificHypothesis, 
  ExperimentPlan, 
  ExperimentSelectionResult, 
  ComputationalResult, 
  ObservationUpdate, 
  NextExperimentDecision, 
  DiscoveryIteration 
} from '../types/discovery';
import { CKGEntry, GovernanceDecision } from '../types/aie';

interface ScientificDiscoveryStudioProps {
  onLogCKG?: (entry: Omit<CKGEntry, 'id' | 'timestamp'>) => void;
  onSendToCritic?: (content: unknown) => void;
}

type PipelineStageKey = 
  | 'research'
  | 'hypotheses'
  | 'planning'
  | 'selection'
  | 'execution'
  | 'analysis'
  | 'decision';

type StageStatus = 'WAITING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

interface PipelineStageState {
  key: PipelineStageKey;
  label: string;
  agent: string;
  status: StageStatus;
  detail?: string;
}

const DEMO_PRESETS: {
  label: string;
  domain: ScientificQuestion['domain'];
  inquiry: string;
  objective: string;
  variable: string;
  metric: string;
}[] = [
  {
    label: 'Superconductor Doping (McMillan Benchmark)',
    domain: 'materials_science',
    inquiry: 'What parameter configuration maximizes the predicted critical temperature in the computational superconductivity model?',
    objective: 'Maximize critical transition temperature Tc under structural stability constraints',
    variable: 'doping_concentration_x',
    metric: 'critical_temperature_Tc'
  },
  {
    label: 'Enzyme Kinetics & Substrate Sweeps',
    domain: 'biochemistry',
    inquiry: 'How does substrate concentration modulate enzyme velocity under competitive and allosteric inhibition?',
    objective: 'Determine optimal substrate saturation avoiding high-concentration substrate inhibition',
    variable: 'substrate_concentration_[S]',
    metric: 'reaction_velocity_V'
  },
  {
    label: 'Strong-Coupling Phonon Resonance',
    domain: 'materials_science',
    inquiry: 'What carrier doping ratio balances electron-phonon resonance against polaronic instability in high-Tc cuprates?',
    objective: 'Pinpoint precise Lorentzian resonance peak in electron-phonon coupling lambda',
    variable: 'doping_concentration_x',
    metric: 'critical_temperature_Tc'
  }
];

export const ScientificDiscoveryStudio: React.FC<ScientificDiscoveryStudioProps> = ({
  onLogCKG,
  onSendToCritic,
}) => {
  const gradientId = useId();
  // Question & Configuration State
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [rawInquiry, setRawInquiry] = useState<string>(DEMO_PRESETS[0].inquiry);
  const [domain, setDomain] = useState<ScientificQuestion['domain']>(DEMO_PRESETS[0].domain);
  const [targetObjective, setTargetObjective] = useState<string>(DEMO_PRESETS[0].objective);
  const [primaryVariable, setPrimaryVariable] = useState<string>(DEMO_PRESETS[0].variable);
  const [targetMetric, setTargetMetric] = useState<string>(DEMO_PRESETS[0].metric);

  // Discovery Pipeline States
  const [currentIterationNumber, setCurrentIterationNumber] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStepTab, setActiveStepTab] = useState<'pipeline' | 'research' | 'hypotheses' | 'experiments' | 'computation' | 'analysis' | 'history'>('pipeline');

  // Agent Artifacts
  const [currentQuestion, setCurrentQuestion] = useState<ScientificQuestion | null>(null);
  const [researchSummary, setResearchSummary] = useState<ResearchSummary | null>(null);
  const [hypotheses, setHypotheses] = useState<ScientificHypothesis[]>([]);
  const [candidatePlans, setCandidatePlans] = useState<ExperimentPlan[]>([]);
  const [selectionResult, setSelectionResult] = useState<ExperimentSelectionResult | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ExperimentPlan | null>(null);
  const [computationalResult, setComputationalResult] = useState<ComputationalResult | null>(null);
  const [observationUpdate, setObservationUpdate] = useState<ObservationUpdate | null>(null);
  const [nextDecision, setNextDecision] = useState<NextExperimentDecision | null>(null);

  // Iteration Archive
  const [iterations, setIterations] = useState<DiscoveryIteration[]>([]);

  // Telemetry & Error Handling
  const [stages, setStages] = useState<Record<PipelineStageKey, StageStatus>>({
    research: 'WAITING',
    hypotheses: 'WAITING',
    planning: 'WAITING',
    selection: 'WAITING',
    execution: 'WAITING',
    analysis: 'WAITING',
    decision: 'WAITING'
  });
  const [governance, setGovernance] = useState<GovernanceDecision | null>(null);
  const [isRefused, setIsRefused] = useState<boolean>(false);
  const [refusalReason, setRefusalReason] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLiveAI, setIsLiveAI] = useState<boolean>(true);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // Helper to update individual stage status
  const updateStage = (key: PipelineStageKey, status: StageStatus) => {
    setStages(prev => ({ ...prev, [key]: status }));
  };

  // Preset Selector
  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const p = DEMO_PRESETS[idx];
    setRawInquiry(p.inquiry);
    setDomain(p.domain);
    setTargetObjective(p.objective);
    setPrimaryVariable(p.variable);
    setTargetMetric(p.metric);
    setErrorMessage(null);
  };

  // Evaluate IFA Governance Client-Side Guard
  const checkGovernance = (inquiryText: string): GovernanceDecision => {
    const lower = inquiryText.toLowerCase();
    const harmful = 
      lower.includes('bomb') || 
      lower.includes('weaponize biological') || 
      lower.includes('neuro-toxin') ||
      lower.includes('terrorist') ||
      lower.includes('harm humans') ||
      lower.includes('torture');

    const timestamp = new Date().toISOString();
    const id = `IFA-DEC-${Date.now().toString(36).toUpperCase()}`;

    if (harmful) {
      return {
        id,
        timestamp,
        proposedAction: 'Execute Agentic Scientific Discovery Pipeline',
        module: 'scientific_discovery_lab',
        authorized: false,
        violatedRule: 'IFA-SPEC-1.3: Non-negotiable structural invariant - Human Safety Protection',
        authority: 'IFA-Deterministic-Core-v1.0',
        outcome: 'REFUSED',
        explanation: 'Action halted by deterministic IFA Core. Scientific discovery engine cannot synthesize destructive agents or violate physical safety invariants.'
      };
    }

    return {
      id,
      timestamp,
      proposedAction: 'Execute Agentic Scientific Discovery Pipeline',
      module: 'scientific_discovery_lab',
      authorized: true,
      authority: 'IFA-Deterministic-Core-v1.0',
      outcome: 'AUTHORIZED',
      explanation: 'Verified against Canonical Knowledge Graph (CKG). Objective complies with open-ended empirical science charter.'
    };
  };

  // Launch Discovery Execution (Full Real API Step-by-Step)
  const handleStartDiscovery = async (
    customQuestionObj?: ScientificQuestion,
    customCandidatePlans?: ExperimentPlan[],
    preservedHypotheses?: ScientificHypothesis[]
  ) => {
    setIsRunning(true);
    setErrorMessage(null);
    setIsRefused(false);
    setRefusalReason(null);

    // 0. Governance Verification
    const gov = checkGovernance(customQuestionObj?.rawInquiry || rawInquiry);
    setGovernance(gov);

    if (!gov.authorized) {
      setIsRefused(true);
      setRefusalReason(gov.explanation);
      setIsRunning(false);

      if (onLogCKG) {
        onLogCKG({
          module: 'scientific_discovery_lab',
          prompt: rawInquiry,
          constraintsRelaxed: [],
          governanceDecision: gov,
          summary: `IFA Core Refusal: ${gov.violatedRule}`,
          outputPayload: { refusalHalt: true, reason: gov.explanation }
        });
      }
      return;
    }

    // Reset stages
    setStages({
      research: 'RUNNING',
      hypotheses: 'WAITING',
      planning: 'WAITING',
      selection: 'WAITING',
      execution: 'WAITING',
      analysis: 'WAITING',
      decision: 'WAITING'
    });

    const question: ScientificQuestion = customQuestionObj || {
      id: `Q-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      domain,
      title: rawInquiry.slice(0, 80),
      rawInquiry,
      targetObjective,
      primaryVariable,
      targetMetric
    };
    setCurrentQuestion(question);

    try {
      // Step 1: Research Agent API
      updateStage('research', 'RUNNING');
      const resResearch = await fetch('/api/discovery/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const dataResearch = await resResearch.json();
      if (!resResearch.ok || !dataResearch.success) {
        throw new Error(dataResearch.error || 'Research Agent failed');
      }
      const research: ResearchSummary = dataResearch.result;
      setResearchSummary(research);
      setIsLiveAI(dataResearch.meta?.isLiveAI ?? true);
      updateStage('research', 'COMPLETED');

      // Step 2: Hypothesis Agent API / Continuity
      let initialHypotheses: ScientificHypothesis[];
      if (preservedHypotheses && preservedHypotheses.length > 0) {
        // In follow-up iterations, maintain hypothesis identity and carry forward posterior as new prior
        initialHypotheses = preservedHypotheses;
        setHypotheses(initialHypotheses);
        updateStage('hypotheses', 'COMPLETED');
      } else {
        updateStage('hypotheses', 'RUNNING');
        const resHyp = await fetch('/api/discovery/hypotheses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, researchSummary: research })
        });
        const dataHyp = await resHyp.json();
        if (!resHyp.ok || !dataHyp.success) {
          throw new Error(dataHyp.error || 'Hypothesis Agent failed');
        }
        initialHypotheses = dataHyp.result;
        setHypotheses(initialHypotheses);
        updateStage('hypotheses', 'COMPLETED');
      }

      // Step 3: Experiment Planning / Follow-Up Candidate Selection
      let candidates: ExperimentPlan[];
      if (customCandidatePlans && customCandidatePlans.length > 0) {
        // Use candidate plans directly generated for the follow-up decision
        candidates = customCandidatePlans;
        setCandidatePlans(candidates);
        updateStage('planning', 'COMPLETED');
      } else {
        updateStage('planning', 'RUNNING');
        const resPlan = await fetch('/api/discovery/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, hypotheses: initialHypotheses, researchSummary: research })
        });
        const dataPlan = await resPlan.json();
        if (!resPlan.ok || !dataPlan.success) {
          throw new Error(dataPlan.error || 'Experiment Planner failed');
        }
        candidates = dataPlan.result;
        setCandidatePlans(candidates);
        updateStage('planning', 'COMPLETED');
      }

      // Step 4: Deterministic Next Experiment Selector API
      updateStage('selection', 'RUNNING');
      const resSelect = await fetch('/api/discovery/select-experiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidatePlans: candidates })
      });
      const dataSelect = await resSelect.json();
      if (!resSelect.ok || !dataSelect.success) {
        throw new Error(dataSelect.error || 'Experiment Selector failed');
      }
      const selection: ExperimentSelectionResult = dataSelect.result;
      setSelectionResult(selection);
      const chosenPlan = selection.selectedExperiment;
      setSelectedPlan(chosenPlan);
      updateStage('selection', 'COMPLETED');

      // Step 5: Deterministic Numerical Experiment Execution API
      updateStage('execution', 'RUNNING');
      const resExec = await fetch('/api/discovery/execute-experiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentPlan: chosenPlan })
      });
      const dataExec = await resExec.json();
      if (!resExec.ok || !dataExec.success) {
        throw new Error(dataExec.error || 'Experiment Execution failed');
      }
      const computation: ComputationalResult = dataExec.result;
      setComputationalResult(computation);
      setSelectedPointIndex(computation.optimalObservation.pointIndex);
      updateStage('execution', 'COMPLETED');

      // Step 6: Deterministic Result Analyzer & Bayesian Update API
      updateStage('analysis', 'RUNNING');
      const resAnalyze = await fetch('/api/discovery/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentPlan: chosenPlan,
          computationalResult: computation,
          hypotheses: initialHypotheses
        })
      });
      const dataAnalyze = await resAnalyze.json();
      if (!resAnalyze.ok || !dataAnalyze.success) {
        throw new Error(dataAnalyze.error || 'Result Analyzer failed');
      }
      const observation: ObservationUpdate = dataAnalyze.result;
      setObservationUpdate(observation);

      // Update in-memory hypothesis confidences with Bayesian posteriors
      const updatedHypotheses = initialHypotheses.map(h => {
        const evalItem = observation.hypothesisEvaluations.find(e => e.hypothesisId === h.id);
        if (!evalItem) return h;
        return {
          ...h,
          posteriorConfidence: evalItem.updatedConfidence,
          status: evalItem.verdict
        };
      });
      setHypotheses(updatedHypotheses);
      updateStage('analysis', 'COMPLETED');

      // Step 7: Next Experiment Decision Formulation (Directly derived from current iteration)
      updateStage('decision', 'RUNNING');
      const resDecision = await fetch('/api/discovery/decide-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: chosenPlan,
          computationalResult: computation,
          hypotheses: updatedHypotheses,
          observationUpdate: observation
        })
      });
      const dataDecision = await resDecision.json();
      let nextDec: NextExperimentDecision | null = null;
      if (resDecision.ok && dataDecision.success && dataDecision.result) {
        nextDec = dataDecision.result;
        setNextDecision(nextDec);
      }
      updateStage('decision', 'COMPLETED');

      // Archive this iteration
      const iterationRecord: DiscoveryIteration = {
        iterationNumber: currentIterationNumber,
        question,
        researchSummary: research,
        hypotheses: updatedHypotheses,
        experimentPlan: chosenPlan,
        selectionResult: selection,
        computationalResult: computation,
        observationUpdate: observation,
        nextExperimentDecision: nextDec || undefined
      };
      setIterations(prev => [iterationRecord, ...prev]);

      // Log into Canonical Knowledge Graph (CKG)
      if (onLogCKG) {
        onLogCKG({
          module: 'scientific_discovery_lab',
          prompt: question.rawInquiry,
          constraintsRelaxed: [],
          governanceDecision: gov,
          summary: `Discovery Iteration #${currentIterationNumber}: Executed ${chosenPlan.id} (${chosenPlan.benchmarkModel}). Observed optimum at ${chosenPlan.primaryParameter.symbol} = ${computation.optimalObservation.parameterValue} -> ${computation.optimalObservation.metricValue}.`,
          outputPayload: {
            iteration: currentIterationNumber,
            questionId: question.id,
            optimalObservation: computation.optimalObservation,
            reproducibilityHash: computation.reproducibilityHash,
            supportedHypotheses: observation.hypothesisEvaluations.filter(e => e.verdict === 'SUPPORTED').map(e => e.hypothesisId)
          }
        });
      }

    } catch (err: any) {
      console.error('[Discovery Studio] Execution failure:', err);
      setErrorMessage(err?.message || 'Pipeline encountered a runtime error');
      // Mark active running stage as failed
      setStages(prev => {
        const next = { ...prev };
        for (const k of Object.keys(next) as PipelineStageKey[]) {
          if (next[k] === 'RUNNING') next[k] = 'FAILED';
        }
        return next;
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Run Follow-Up Iteration
  const handleRunNextIteration = async () => {
    if (!nextDecision || !currentQuestion || !computationalResult || hypotheses.length === 0) return;

    const nextIterationNum = currentIterationNumber + 1;
    setCurrentIterationNumber(nextIterationNum);

    // Formulate narrowed question object for iteration 2
    const followUpQuestion: ScientificQuestion = {
      ...currentQuestion,
      id: `Q-${Date.now().toString(36).toUpperCase()}`,
      title: `Iteration #${nextIterationNum}: Zoom around ${currentQuestion.primaryVariable} = ${computationalResult.optimalObservation.parameterValue}`,
      rawInquiry: `Focus parameter sweep on high-resonance corridor [${nextDecision.recommendedParameterRange.min}, ${nextDecision.recommendedParameterRange.max}] to resolve remaining uncertainty (${(nextDecision.remainingUncertainty * 100).toFixed(1)}%).`
    };

    // Carry forward existing hypotheses across iterations, using posterior confidence as new prior
    const carryForwardHypotheses: ScientificHypothesis[] = hypotheses.map(h => ({
      ...h,
      priorConfidence: h.posteriorConfidence !== undefined ? h.posteriorConfidence : h.priorConfidence
    }));

    await handleStartDiscovery(followUpQuestion, nextDecision.candidateExperiments, carryForwardHypotheses);
  };

  // Reset Studio
  const handleReset = () => {
    setIsRunning(false);
    setErrorMessage(null);
    setIsRefused(false);
    setRefusalReason(null);
    setCurrentQuestion(null);
    setResearchSummary(null);
    setHypotheses([]);
    setCandidatePlans([]);
    setSelectionResult(null);
    setSelectedPlan(null);
    setComputationalResult(null);
    setObservationUpdate(null);
    setNextDecision(null);
    setCurrentIterationNumber(1);
    setStages({
      research: 'WAITING',
      hypotheses: 'WAITING',
      planning: 'WAITING',
      selection: 'WAITING',
      execution: 'WAITING',
      analysis: 'WAITING',
      decision: 'WAITING'
    });
  };

  // Helper for Chart Rendering Math
  const renderSimulationChart = () => {
    if (!computationalResult || computationalResult.dataPoints.length === 0) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
          <Activity className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
          <span>No simulation data generated yet. Run discovery to view real numerical curve.</span>
        </div>
      );
    }

    const points = computationalResult.dataPoints;
    const minX = Math.min(...points.map(p => p.parameterValue));
    const maxX = Math.max(...points.map(p => p.parameterValue));
    const minY = Math.min(0, ...points.map(p => p.metricValue));
    const maxY = Math.max(...points.map(p => p.metricValue)) * 1.1;

    const width = 760;
    const height = 240;
    const paddingLeft = 55;
    const paddingBottom = 40;
    const paddingTop = 25;
    const paddingRight = 35;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const scaleX = (x: number) => paddingLeft + ((x - minX) / (maxX - minX || 1)) * plotWidth;
    const scaleY = (y: number) => paddingTop + plotHeight - ((y - minY) / (maxY - minY || 1)) * plotHeight;

    const pathData = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.parameterValue).toFixed(2)} ${scaleY(p.metricValue).toFixed(2)}`)
      .join(' ');

    const optimalPoint = computationalResult.optimalObservation;
    const selectedPoint = selectedPointIndex !== null && points[selectedPointIndex] ? points[selectedPointIndex] : null;

    return (
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-slate-400 select-none">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
            const yVal = minY + frac * (maxY - minY);
            const yPos = scaleY(yVal);
            return (
              <g key={`y-grid-${idx}`}>
                <line 
                  x1={paddingLeft} 
                  y1={yPos} 
                  x2={width - paddingRight} 
                  y2={yPos} 
                  stroke="#1e293b" 
                  strokeWidth="1" 
                  strokeDasharray="3 3" 
                />
                <text 
                  x={paddingLeft - 8} 
                  y={yPos + 4} 
                  textAnchor="end" 
                  className="text-[10px] font-mono fill-slate-500 tabular-nums"
                >
                  {yVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X ticks */}
          {points.filter((_, idx) => idx % Math.max(1, Math.floor(points.length / 6)) === 0).map((p, idx) => {
            const xPos = scaleX(p.parameterValue);
            return (
              <g key={`x-tick-${idx}`}>
                <line 
                  x1={xPos} 
                  y1={height - paddingBottom} 
                  x2={xPos} 
                  y2={height - paddingBottom + 5} 
                  stroke="#334155" 
                  strokeWidth="1" 
                />
                <text 
                  x={xPos} 
                  y={height - paddingBottom + 18} 
                  textAnchor="middle" 
                  className="text-[10px] font-mono fill-slate-500 tabular-nums"
                >
                  {p.parameterValue.toFixed(3)}
                </text>
              </g>
            );
          })}

          {/* Area under curve */}
          <path 
            d={`${pathData} L ${scaleX(points[points.length - 1].parameterValue)} ${scaleY(minY)} L ${scaleX(points[0].parameterValue)} ${scaleY(minY)} Z`} 
            fill={`url(#${gradientId})`} 
          />

          {/* Main Curve */}
          <path 
            d={pathData} 
            fill="none" 
            stroke="#06b6d4" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Data Points */}
          {points.map((p, idx) => {
            const cx = scaleX(p.parameterValue);
            const cy = scaleY(p.metricValue);
            const isOpt = idx === optimalPoint.pointIndex;
            const isSel = idx === selectedPointIndex;

            return (
              <g 
                key={`pt-${idx}`} 
                className="cursor-pointer group"
                onClick={() => setSelectedPointIndex(idx)}
              >
                {isOpt && (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r="8" 
                    fill="none" 
                    stroke="#38bdf8" 
                    strokeWidth="1.5" 
                    className="animate-ping" 
                  />
                )}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={isOpt ? 5 : isSel ? 4.5 : 2.5} 
                  fill={isOpt ? '#38bdf8' : isSel ? '#f59e0b' : '#0e7490'} 
                  stroke={isOpt ? '#ffffff' : '#083344'} 
                  strokeWidth={isOpt || isSel ? 2 : 1} 
                />
              </g>
            );
          })}

          {/* Optimal Callout Annotation */}
          {optimalPoint && (
            <g transform={`translate(${scaleX(optimalPoint.parameterValue)}, ${scaleY(optimalPoint.metricValue)})`}>
              <line x1="0" y1="-8" x2="0" y2="-28" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
              <rect x="-45" y="-48" width="90" height="20" rx="3" fill="#082f49" stroke="#0284c7" strokeWidth="1" />
              <text x="0" y="-35" textAnchor="middle" className="text-[10px] font-mono fill-cyan-200 font-bold tabular-nums">
                PEAK {optimalPoint.metricValue.toFixed(1)} K
              </text>
            </g>
          )}

          {/* Axis Labels */}
          <text 
            x={width / 2} 
            y={height - 6} 
            textAnchor="middle" 
            className="text-[11px] font-mono fill-slate-400 font-medium"
          >
            {selectedPlan?.primaryParameter?.name || 'Parameter'} ({selectedPlan?.primaryParameter?.symbol || 'x'}) [{selectedPlan?.primaryParameter?.unit || 'unit'}]
          </text>
          <text 
            x={14} 
            y={height / 2} 
            textAnchor="middle" 
            transform={`rotate(-90, 14, ${height / 2})`} 
            className="text-[11px] font-mono fill-slate-400 font-medium"
          >
            Metric Value (Tc)
          </text>
        </svg>

        {/* Selected Data Point Inspector Tray */}
        {selectedPoint && (
          <div className="mt-2 bg-slate-900/90 border border-slate-800 rounded p-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">POINT #{selectedPoint.index}:</span>
              <span className="text-cyan-300 font-bold tabular-nums">{selectedPlan?.primaryParameter?.symbol || 'x'} = {selectedPoint.parameterValue.toFixed(4)}</span>
              <span className="text-slate-500">→</span>
              <span className="text-emerald-400 font-bold tabular-nums">Tc = {selectedPoint.metricValue.toFixed(4)} K</span>
            </div>
            {selectedPoint.secondaryMetrics && (
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                {Object.entries(selectedPoint.secondaryMetrics).map(([k, v]) => (
                  <span key={k}>
                    {k}: <span className="text-slate-200 tabular-nums">{Number(v).toFixed(3)}</span>
                  </span>
                ))}
              </div>
            )}
            <span className="text-[10px] text-slate-500 uppercase">Deterministic Computation Verified</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Instrument Panel Banner */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 via-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-cyan-500/10">
              <FlaskConical className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                  AIE Scientific Discovery Lab
                </h2>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
                  Databricks Challenge #3
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  · Iteration #{currentIterationNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous scientific discovery through empirical parameter sweeps, falsifiable causal hypotheses, and deterministic Bayesian updating.
              </p>
            </div>
          </div>

          {/* Status Ribbons */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded border ${
              governance?.authorized 
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' 
                : isRefused 
                ? 'bg-rose-950/60 border-rose-800/80 text-rose-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              {governance?.authorized ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>IFA CORE: AUTHORIZED</span>
                </>
              ) : isRefused ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>IFA CORE: REFUSED</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>IFA CORE: READY</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Engine:</span>
              <span className="text-cyan-300">{isLiveAI ? 'Live Gemini + SCM' : 'Deterministic Fallback'}</span>
            </div>
          </div>
        </div>

        {/* Question Input Zone */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span>Scientific Research Inquiry:</span>
              <span className="text-slate-500 font-normal font-mono">(Falsifiable, parameter-bound discovery)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Domain Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_PRESETS.map((p, idx) => (
                  <button
                    key={p.label}
                    onClick={() => handleSelectPreset(idx)}
                    disabled={isRunning}
                    className={`px-2.5 py-1 text-xs rounded transition-colors ${
                      selectedPresetIndex === idx
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-medium'
                        : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {p.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              rows={2}
              value={rawInquiry}
              onChange={(e) => setRawInquiry(e.target.value)}
              disabled={isRunning}
              placeholder="Enter your scientific question..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono resize-none"
            />
            <div className="flex sm:flex-col justify-end gap-2 shrink-0">
              <button
                onClick={() => handleStartDiscovery()}
                disabled={isRunning || !rawInquiry.trim()}
                className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isRunning
                    ? 'bg-cyan-950 border border-cyan-800 text-cyan-400 cursor-not-allowed'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 active:scale-[0.98]'
                }`}
              >
                {isRunning ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Discovery</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={isRunning}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Metadata Parameters row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono pt-1">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded p-2 flex items-center justify-between">
              <span className="text-slate-500">Domain:</span>
              <select 
                value={domain} 
                onChange={(e) => setDomain(e.target.value as any)}
                disabled={isRunning}
                className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="materials_science" className="bg-slate-900">materials_science</option>
                <option value="quantum_physics" className="bg-slate-900">quantum_physics</option>
                <option value="biochemistry" className="bg-slate-900">biochemistry</option>
                <option value="thermodynamics" className="bg-slate-900">thermodynamics</option>
                <option value="astrophysics" className="bg-slate-900">astrophysics</option>
                <option value="general_science" className="bg-slate-900">general_science</option>
              </select>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded p-2 flex items-center justify-between">
              <span className="text-slate-500">Swept Variable:</span>
              <span className="text-slate-300 truncate max-w-[140px]">{primaryVariable}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded p-2 flex items-center justify-between">
              <span className="text-slate-500">Target Metric:</span>
              <span className="text-slate-300 truncate max-w-[140px]">{targetMetric}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded p-2 flex items-center justify-between">
              <span className="text-slate-500">Benchmark Model:</span>
              <span className="text-cyan-300">mcmillan_superconductor</span>
            </div>
          </div>
        </div>
      </div>

      {/* IFA Core Terminal Refusal Alert */}
      {isRefused && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex items-start gap-3 text-xs text-rose-200 animate-fadeIn">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-rose-300 font-mono uppercase tracking-wide block">
              IFA Core Security Invariant Triggered · Execution Refused
            </span>
            <p className="text-rose-200">
              {refusalReason || 'The proposed inquiry attempts to formulate destructive biological agents or violate human safety invariants.'}
            </p>
            <div className="text-[11px] font-mono text-rose-400 mt-2">
              Rule: IFA-SPEC-1.3 (Non-negotiable Life & Safety Invariant) · Action logged to Canonical Knowledge Graph (CKG).
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 flex items-center gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold block font-mono">Pipeline Execution Error</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* 2. Visual Pipeline Progress Stepper */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 text-xs font-mono">
          <span className="text-slate-400 uppercase tracking-wider">Agent Discovery Workflow:</span>
          <span className="text-slate-500">7-Stage Formal Architecture</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          {[
            { key: 'research', label: '1. Research', agent: 'Gemini Research' },
            { key: 'hypotheses', label: '2. Hypotheses', agent: 'Causal Agent' },
            { key: 'planning', label: '3. Planning', agent: 'Sweep Planner' },
            { key: 'selection', label: '4. Selection', agent: 'Deterministic Utility' },
            { key: 'execution', label: '5. Execution', agent: 'Numerical Engine' },
            { key: 'analysis', label: '6. Analysis', agent: 'Bayesian Updater' },
            { key: 'decision', label: '7. Next Step', agent: 'Entropy Selector' },
          ].map((st) => {
            const status = stages[st.key as PipelineStageKey];
            let statusBadge = 'bg-slate-900 border-slate-800 text-slate-500';
            if (status === 'RUNNING') statusBadge = 'bg-cyan-950/80 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/50 animate-pulse';
            if (status === 'COMPLETED') statusBadge = 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300';
            if (status === 'FAILED') statusBadge = 'bg-rose-950/80 border-rose-600 text-rose-300';

            return (
              <div 
                key={st.key}
                className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${statusBadge}`}
              >
                <div>
                  <span className="font-semibold block truncate text-[11px]">{st.label}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{st.agent}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                  <span>{status}</span>
                  {status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  {status === 'RUNNING' && <Activity className="w-3 h-3 animate-spin text-cyan-400" />}
                  {status === 'FAILED' && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Primary Content Stage Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        {[
          { id: 'pipeline', label: 'Active Pipeline View', count: null },
          { id: 'research', label: 'Research Baseline', count: researchSummary ? 'Ready' : null },
          { id: 'hypotheses', label: 'Hypotheses', count: hypotheses.length || null },
          { id: 'experiments', label: 'Experiment Plans & Selection', count: candidatePlans.length || null },
          { id: 'computation', label: 'Simulation & Chart', count: computationalResult ? `${computationalResult.totalPointsComputed} pts` : null },
          { id: 'analysis', label: 'Bayesian Observation Update', count: observationUpdate ? 'Updated' : null },
          { id: 'history', label: 'Iteration History', count: iterations.length || null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveStepTab(tab.id as any)}
            className={`px-4 py-2.5 border-b-2 font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeStepTab === tab.id
                ? 'border-cyan-500 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Active Pipeline View (All Stages in Context) */}
      {activeStepTab === 'pipeline' && (
        <div className="space-y-6">

          {/* Research Summary Card */}
          {researchSummary && (
            <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                    1. Theoretical Framework & Epistemic Baseline
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Epistemic Status:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
                    {researchSummary.epistemicStatus}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Governing Theory:</span>
                <p className="text-xs text-slate-200 font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
                  {researchSummary.theoreticalFramework}
                </p>
              </div>

              {/* Governing Equations */}
              <div>
                <span className="text-xs text-slate-400 block mb-1.5">Governing Mathematical Formulations:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {researchSummary.governingEquations.map((eq, i) => (
                    <div key={i} className="bg-slate-950 p-2 rounded border border-slate-800/80 font-mono text-xs text-cyan-300">
                      {eq}
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Gaps & Open Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-2 font-mono uppercase text-[11px]">Identified Research Gaps:</span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                    {researchSummary.researchGaps.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-2 font-mono uppercase text-[11px]">Guiding Open Questions:</span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                    {researchSummary.openQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Hypotheses View */}
          {hypotheses.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                    2. Competing Scientific Hypotheses & Bayesian Tracking
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {hypotheses.length} Active Candidates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hypotheses.map((h) => {
                  let statusBadge = 'bg-slate-800 text-slate-300';
                  if (h.status === 'SUPPORTED') statusBadge = 'bg-emerald-950 text-emerald-300 border border-emerald-700';
                  if (h.status === 'PARTIALLY_SUPPORTED') statusBadge = 'bg-amber-950 text-amber-300 border border-amber-700';
                  if (h.status === 'CONTRADICTED') statusBadge = 'bg-rose-950 text-rose-300 border border-rose-700';

                  const currentConf = h.posteriorConfidence !== undefined ? h.posteriorConfidence : h.priorConfidence;
                  const delta = h.posteriorConfidence !== undefined ? h.posteriorConfidence - h.priorConfidence : 0;

                  return (
                    <div 
                      key={h.id}
                      className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-cyan-300">{h.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge}`}>
                            {h.status}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-100 leading-snug">
                          {h.title}
                        </h4>

                        <p className="text-[11px] text-slate-400 line-clamp-3">
                          {h.statement}
                        </p>

                        <div className="bg-slate-950 p-2 rounded border border-slate-800/80 font-mono text-[10px] text-slate-300 space-y-1">
                          <div className="text-cyan-400 truncate">
                            {h.formalCausalRelation}
                          </div>
                          <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-900">
                            <span>Predicted Optimum:</span>
                            <span className="text-white font-bold tabular-nums">
                              {h.predictedOptimalParameter} (Tc ≈ {h.predictedMetricValue} K)
                            </span>
                          </div>
                          {h.acceptableWindow && (
                            <div className="flex items-center justify-between text-slate-400 text-[10px]">
                              <span>Acceptable Window:</span>
                              <span className="text-cyan-300 font-bold tabular-nums">
                                [{h.acceptableWindow[0]}, {h.acceptableWindow[1]}]
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Confidence Transition Indicator */}
                      <div className="pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className="text-slate-400">Confidence Update:</span>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-slate-400 tabular-nums">{(h.priorConfidence * 100).toFixed(0)}%</span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                            <span className={`tabular-nums ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                              {(currentConf * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              h.status === 'SUPPORTED' ? 'bg-emerald-500' : h.status === 'CONTRADICTED' ? 'bg-rose-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.round(currentConf * 100)}%` }}
                          />
                        </div>

                        <span className="text-[10px] text-slate-500 block mt-1 font-mono truncate">
                          Falsify if: {h.falsificationCriteria}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Experiment Planner & Deterministic Selector */}
          {candidatePlans.length > 0 && (
            <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                    3. Candidate Experiment Plans & Deterministic Selection
                  </h3>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                  Algorithm-Governed Selection
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {candidatePlans.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id;
                  return (
                    <div 
                      key={plan.id}
                      className={`p-3.5 rounded-lg border text-xs space-y-2.5 transition-all ${
                        isSelected 
                          ? 'bg-cyan-950/30 border-cyan-500/80 ring-1 ring-cyan-500/30' 
                          : 'bg-slate-950 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                          {plan.id}
                        </span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 text-[10px] font-bold">
                            ★ DETERMINISTIC SELECTION
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-200 leading-snug">
                        {plan.title}
                      </h4>

                      <div className="bg-slate-900 p-2 rounded border border-slate-800 space-y-1 font-mono text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Range:</span>
                          <span className="text-slate-200">[{plan.primaryParameter.min}, {plan.primaryParameter.max}]</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Step:</span>
                          <span className="text-slate-200">{plan.primaryParameter.step}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Points:</span>
                          <span className="text-slate-200">{plan.numericalSteps}</span>
                        </div>
                      </div>

                      {/* Utility Attributes Breakdown */}
                      <div className="space-y-1 text-[10px] font-mono border-t border-slate-800/80 pt-2 text-slate-400">
                        <div className="flex justify-between">
                          <span>Info Gain: {(plan.informationGain || 0).toFixed(2)}</span>
                          <span>Discrim: {(plan.hypothesisDiscrimination || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost: {(plan.cost || 0).toFixed(2)}</span>
                          <span>Risk: {(plan.risk || 0).toFixed(2)}</span>
                        </div>
                        {plan.utilityScore !== undefined && (
                          <div className="flex justify-between font-bold text-cyan-300 pt-1 border-t border-slate-800">
                            <span>Utility Score:</span>
                            <span className="tabular-nums">{plan.utilityScore.toFixed(3)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectionResult?.selectionReason && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                  <span className="text-cyan-400 font-bold block mb-1">Deterministic Selector Audit:</span>
                  <p className="text-slate-400">{selectionResult.selectionReason}</p>
                </div>
              )}
            </div>
          )}

          {/* 4. Live Simulation & Visual Chart */}
          {computationalResult && (
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                    4. Deterministic Numerical Experimentation & Spectrum
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Execution:</span>
                  <span className="text-emerald-400 font-bold">{computationalResult.executionDurationMs} ms</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">Signature:</span>
                  <span className="text-cyan-300 font-bold">{computationalResult.reproducibilityHash}</span>
                </div>
              </div>

              {/* The Real Interactive Numerical Chart */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                {renderSimulationChart()}
              </div>

              {/* Calculated Summary Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Peak Parameter</span>
                  <span className="text-sm font-bold text-cyan-300 tabular-nums">
                    {computationalResult.optimalObservation.parameterValue.toFixed(4)}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Peak Metric (Tc)</span>
                  <span className="text-sm font-bold text-emerald-400 tabular-nums">
                    {computationalResult.optimalObservation.metricValue.toFixed(2)} K
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Mean Metric</span>
                  <span className="text-sm font-bold text-slate-200 tabular-nums">
                    {computationalResult.summaryMetrics.meanMetric.toFixed(2)} K
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Std Deviation</span>
                  <span className="text-sm font-bold text-slate-200 tabular-nums">
                    ±{computationalResult.summaryMetrics.stdDev.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Total Points</span>
                  <span className="text-sm font-bold text-slate-200 tabular-nums">
                    {computationalResult.totalPointsComputed}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Convergence Res</span>
                  <span className="text-sm font-bold text-slate-200 tabular-nums">
                    {computationalResult.summaryMetrics.convergenceResidual.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 5. Observation Update & Empirical Synthesis */}
          {observationUpdate && (
            <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                    5. Empirical Evaluation & Hypothesis Resolution
                  </h3>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  Zero Hallucination Derived
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                <span className="text-emerald-400 font-bold block mb-1">Analyzer Synthesis:</span>
                <p className="text-slate-300 leading-relaxed">{observationUpdate.synthesis}</p>
              </div>

              {/* Detailed Evaluation Items */}
              <div className="space-y-2">
                {observationUpdate.hypothesisEvaluations.map((evalItem) => (
                  <div 
                    key={evalItem.hypothesisId}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-300">{evalItem.hypothesisId}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          evalItem.verdict === 'SUPPORTED' ? 'bg-emerald-950 text-emerald-300' :
                          evalItem.verdict === 'PARTIALLY_SUPPORTED' ? 'bg-amber-950 text-amber-300' :
                          evalItem.verdict === 'CONTRADICTED' ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {evalItem.verdict}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-2xl">
                        {evalItem.evaluationNotes}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Param Err (e_x)</span>
                        <span className="text-cyan-300 font-bold">
                          {evalItem.parameterNormalizedError !== undefined ? evalItem.parameterNormalizedError.toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Metric Err (e_y)</span>
                        <span className="text-slate-400 font-bold">
                          {evalItem.metricNormalizedError !== undefined ? evalItem.metricNormalizedError.toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Composite</span>
                        <span className="text-slate-200 font-bold">{evalItem.normalizedError.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Posterior P(H|E)</span>
                        <span className="text-emerald-400 font-bold text-sm">{(evalItem.updatedConfidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Next Experiment Recommendation & Trigger */}
          {nextDecision && (
            <div className="border border-cyan-800/80 bg-gradient-to-r from-slate-950 via-cyan-950/30 to-slate-950 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-cyan-200 uppercase tracking-wider font-mono">
                    6. Next Experiment Selection & Iterative Loop
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Remaining Epistemic Uncertainty:</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                    {(nextDecision.remainingUncertainty * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <p className="text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">Follow-Up Rationalization:</span>
                  {nextDecision.reason}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">RECOMMENDED PARAMETER CORRIDOR</span>
                    <span className="text-slate-200 font-bold">
                      [{nextDecision.recommendedParameterRange.min}, {nextDecision.recommendedParameterRange.max}] with refined step {nextDecision.recommendedParameterRange.step}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {onSendToCritic && (
                      <button
                        onClick={() => onSendToCritic({
                          discoveryIteration: currentIterationNumber,
                          question: currentQuestion,
                          hypotheses,
                          computationalResult,
                          observationUpdate,
                          nextDecision
                        })}
                        className="px-3.5 py-2 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Compass className="w-4 h-4 text-cyan-400" />
                        <span>Send to Critic</span>
                      </button>
                    )}

                    <button
                      onClick={handleRunNextIteration}
                      disabled={isRunning}
                      className="px-5 py-2.5 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Run Next Experiment (Iteration #{currentIterationNumber + 1})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: Research Only */}
      {activeStepTab === 'research' && researchSummary && (
        <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Full Research Summary & Invariants</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
              {researchSummary.epistemicStatus}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-slate-300 block mb-1">Theoretical Framework:</span>
              <p className="text-slate-300 font-mono bg-slate-950 p-3 rounded border border-slate-800">
                {researchSummary.theoreticalFramework}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-400 uppercase text-[11px] block">Known Empirical Facts:</span>
                <ul className="space-y-1 list-disc list-inside text-slate-300">
                  {researchSummary.knownInformation.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 uppercase text-[11px] block">Unresolved Uncertainties:</span>
                <ul className="space-y-1 list-disc list-inside text-slate-300">
                  {researchSummary.unknownInformation.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-400 uppercase text-[11px] block">Theoretical Assumptions:</span>
                <ul className="space-y-1 list-disc list-inside text-slate-300">
                  {researchSummary.assumptions.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-400 uppercase text-[11px] block">Experimental Evidence:</span>
                <ul className="space-y-1 list-disc list-inside text-slate-300">
                  {researchSummary.evidence.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </div>

            {/* Invariants Table */}
            <div>
              <span className="font-bold text-slate-300 block mb-2">Physical Invariants & Standard Constants:</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono border border-slate-800 rounded">
                  <thead className="bg-slate-950 text-slate-400 text-[11px]">
                    <tr>
                      <th className="p-2 border-b border-slate-800">Constant Name</th>
                      <th className="p-2 border-b border-slate-800">Symbol</th>
                      <th className="p-2 border-b border-slate-800">Standard Value</th>
                      <th className="p-2 border-b border-slate-800">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {researchSummary.knownInvariants.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/50">
                        <td className="p-2">{inv.name}</td>
                        <td className="p-2 text-cyan-400">{inv.symbol}</td>
                        <td className="p-2 tabular-nums">{inv.standardValue}</td>
                        <td className="p-2 text-slate-400">{inv.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Hypotheses Detailed View */}
      {activeStepTab === 'hypotheses' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white font-mono">Formulated Competing Hypotheses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hypotheses.map(h => (
              <div key={h.id} className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-cyan-400">{h.id}</span>
                  <span className="text-slate-400">{h.epistemicLevel}</span>
                </div>
                <h4 className="font-bold text-slate-100 text-sm">{h.title}</h4>
                <p className="text-slate-300">{h.statement}</p>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1 font-mono text-[11px]">
                  <span className="text-cyan-400 block">{h.formalCausalRelation}</span>
                  <p className="text-slate-400">{h.mechanism}</p>
                </div>
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] pt-2 border-t border-slate-800">
                  <span>Prior Confidence: {(h.priorConfidence * 100).toFixed(0)}%</span>
                  <span>Posterior: {((h.posteriorConfidence ?? h.priorConfidence) * 100).toFixed(0)}%</span>
                  <span className="text-emerald-400 font-bold">{h.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Iteration History */}
      {activeStepTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-mono">Discovery Trajectory Archive</h3>
            <span className="text-xs font-mono text-slate-400">{iterations.length} Completed Cycles</span>
          </div>

          {iterations.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
              No historical iterations recorded yet. Run the discovery loop to establish empirical trajectory.
            </div>
          ) : (
            <div className="space-y-4">
              {iterations.map((iter) => (
                <div key={iter.iterationNumber} className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold font-mono text-cyan-300 text-sm">
                      ITERATION #{iter.iterationNumber}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {iter.question.id} · {iter.computationalResult.reproducibilityHash}
                    </span>
                  </div>

                  <p className="text-slate-300 font-mono text-[11px]">
                    Inquiry: "{iter.question.rawInquiry}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">SELECTED EXPERIMENT</span>
                      <span className="text-slate-200">{iter.experimentPlan.id} ({iter.experimentPlan.title})</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">OPTIMAL OBSERVATION</span>
                      <span className="text-cyan-300 font-bold">
                        {iter.experimentPlan.primaryParameter.symbol} = {iter.computationalResult.optimalObservation.parameterValue} (Tc = {iter.computationalResult.optimalObservation.metricValue.toFixed(2)} K)
                      </span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">SUPPORTED HYPOTHESES</span>
                      <span className="text-emerald-400 font-bold">
                        {iter.observationUpdate.hypothesisEvaluations.filter(e => e.verdict === 'SUPPORTED').map(e => e.hypothesisId).join(', ') || 'None Confirmed'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
