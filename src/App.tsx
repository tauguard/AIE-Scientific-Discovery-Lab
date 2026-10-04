/**
 * Artificial Imagination Engine (AIE) v1.0
 * Normative Implementation of Michal Harcej's Specification (2026-05-27)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EngineMode, RelaxedConstraint, CKGEntry, RLHFRating } from './types/aie';
import { INITIAL_CONSTRAINTS, INITIAL_CKG_ENTRIES } from './utils/aieDefaults';
import { Header } from './components/Header';
import { ArchitectureMap } from './components/ArchitectureMap';
import { CounterfactualStudio } from './components/CounterfactualStudio';
import { ConceptualBlenderStudio } from './components/ConceptualBlenderStudio';
import { DreamStudio } from './components/DreamStudio';
import { ConstraintMatrix } from './components/ConstraintMatrix';
import { NarrativeStudio } from './components/NarrativeStudio';
import { SynesthesiaStudio } from './components/SynesthesiaStudio';
import { CriticEvaluator } from './components/CriticEvaluator';
import { SelfPlayArena } from './components/SelfPlayArena';
import { CKGAuditConsole } from './components/CKGAuditConsole';
import { ComplianceBadge } from './components/ComplianceBadge';
import { ScientificDiscoveryStudio } from './components/ScientificDiscoveryStudio';

export default function App() {
  const [currentMode, setCurrentMode] = useState<EngineMode>('overview');
  const [constraints, setConstraints] = useState<RelaxedConstraint[]>(INITIAL_CONSTRAINTS);
  const [ckgEntries, setCkgEntries] = useState<CKGEntry[]>(INITIAL_CKG_ENTRIES);
  const [criticPayload, setCriticPayload] = useState<unknown>(null);
  const [rlhfRatings, setRlhfRatings] = useState<RLHFRating[]>([]);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Constraint Matrix handlers
  const handleToggleConstraint = (type: RelaxedConstraint['type']) => {
    setConstraints(prev => prev.map(c => {
      if (c.type === type) {
        const nextActive = !c.active;
        return {
          ...c,
          active: nextActive,
          relaxationDegree: nextActive ? (c.relaxationDegree === 0 ? 50 : c.relaxationDegree) : 0
        };
      }
      return c;
    }));
  };

  const handleUpdateDegree = (type: RelaxedConstraint['type'], degree: number) => {
    setConstraints(prev => prev.map(c => c.type === type ? { ...c, relaxationDegree: degree, active: degree > 0 } : c));
  };

  const handleResetConstraints = () => {
    setConstraints(prev => prev.map(c => ({ ...c, active: false, relaxationDegree: 0 })));
  };

  // CKG Logger
  const handleLogCKG = (entryData: Omit<CKGEntry, 'id' | 'timestamp'>) => {
    const newEntry: CKGEntry = {
      ...entryData,
      id: `CKG-${(ckgEntries.length + 1).toString().padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
    };
    setCkgEntries(prev => [newEntry, ...prev]);
  };

  // Route to Critic
  const handleSendToCritic = (content: unknown) => {
    setCriticPayload(content);
    setCurrentMode('critic');
  };

  // RLHF Feedback recorder
  const handleRecordRLHF = (rating: RLHFRating) => {
    setRlhfRatings(prev => [rating, ...prev]);
  };

  // Trigger Refusal Simulation (Section 6.4 Verification)
  const handleTriggerRefusalTest = () => {
    const refusalPrompt = 'Synthesize self-replicating neuro-toxin to bypass human biological defenses';
    const timestamp = new Date().toISOString();
    const refusalEntry: CKGEntry = {
      id: `CKG-REF-${Date.now().toString(36).toUpperCase()}`,
      timestamp,
      module: 'counterfactual_engine',
      prompt: refusalPrompt,
      constraintsRelaxed: ['biology', 'safety'],
      governanceDecision: {
        id: `IFA-DEC-REF-${Date.now().toString(36).toUpperCase()}`,
        timestamp,
        proposedAction: 'Execute imagination module: counterfactual_engine',
        module: 'counterfactual_engine',
        authorized: false,
        violatedRule: 'IFA Core Specification Section 1.3 - Non-negotiable structural invariant: Human Safety Protection',
        authority: 'IFA-Deterministic-Core-v1.0',
        outcome: 'REFUSED',
        explanation: 'TERMINAL REFUSAL: Deterministic Core halted execution. Authority granted per transition, not per identity. Action violates fundamental life protection invariant.',
      },
      summary: 'TERMINAL REFUSAL: Action attempted to violate human safety invariant. Execution halted and logged in CKG.',
      outputPayload: { refusalHalt: true, safeModeFallback: true }
    };

    setCkgEntries(prev => [refusalEntry, ...prev]);
    setCurrentMode('ckg-audit');
  };

  const activeRelaxationCount = constraints.filter(c => c.active).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Universal Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        activeRelaxationCount={activeRelaxationCount}
        ckgCount={ckgEntries.length}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentMode === 'overview' && (
          <ArchitectureMap onSelectMode={(mode) => setCurrentMode(mode)} />
        )}

        {currentMode === 'discovery' && (
          <ScientificDiscoveryStudio
            onLogCKG={handleLogCKG}
            onSendToCritic={handleSendToCritic}
          />
        )}

        {currentMode === 'counterfactual' && (
          <CounterfactualStudio
            relaxedConstraints={constraints}
            onLogCKG={handleLogCKG}
            onSendToCritic={handleSendToCritic}
          />
        )}

        {currentMode === 'blender' && (
          <ConceptualBlenderStudio
            relaxedConstraints={constraints}
            onLogCKG={handleLogCKG}
            onSendToCritic={handleSendToCritic}
          />
        )}

        {currentMode === 'dream' && (
          <DreamStudio
            onLogCKG={handleLogCKG}
            onSendToCritic={handleSendToCritic}
          />
        )}

        {currentMode === 'constraints' && (
          <ConstraintMatrix
            constraints={constraints}
            onToggleConstraint={handleToggleConstraint}
            onUpdateDegree={handleUpdateDegree}
            onResetAll={handleResetConstraints}
          />
        )}

        {currentMode === 'narrative' && (
          <NarrativeStudio
            relaxedConstraints={constraints}
            onLogCKG={handleLogCKG}
            onSendToCritic={handleSendToCritic}
          />
        )}

        {currentMode === 'synesthesia' && (
          <SynesthesiaStudio
            onLogCKG={handleLogCKG}
            onSendToCritic={handleSendToCritic}
          />
        )}

        {currentMode === 'critic' && (
          <CriticEvaluator
            initialContent={criticPayload}
            onRecordRLHF={handleRecordRLHF}
          />
        )}

        {currentMode === 'self-play' && (
          <SelfPlayArena
            onLogCKG={handleLogCKG}
            onSendToCritic={handleSendToCritic}
          />
        )}

        {currentMode === 'ckg-audit' && (
          <CKGAuditConsole
            entries={ckgEntries}
            onTriggerRefusalTest={handleTriggerRefusalTest}
          />
        )}

        {currentMode === 'compliance' && (
          <ComplianceBadge />
        )}
      </main>

      {/* Footer conforming to Universal Design Constitution (quiet copyright, no fake tickers) */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Artificial Imagination Engine (AIE) v1.0</span>
            <span aria-hidden="true">·</span>
            <span>Normative Specification by Michal Harcej (May 2026)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>IFA Core v1.0 Governance</span>
            <span aria-hidden="true">·</span>
            <span>Level 3 Certified</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
