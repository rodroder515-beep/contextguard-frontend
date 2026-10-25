import React, { useEffect, useMemo, useState } from 'react';
import { analyzeRemote, submitApprovedRemote, API_BASE_URL, AnalyzeResponse } from '../utils/api';
import {
  DESTINATIONS,
  DestinationId,
  DetectedEntity,
  PolicyDecision,
  WORKFLOW_SCENARIOS,
  evaluateWorkflowContext,
} from '../utils/contextGuardEngine';
import {
  Check,
  ShieldCheck,
  ShieldAlert,
  Eye,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const InteractiveDemoSection: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(WORKFLOW_SCENARIOS[0].id);
  const [taskObjective, setTaskObjective] = useState<string>(WORKFLOW_SCENARIOS[0].taskObjective);
  const [rawPrompt, setRawPrompt] = useState<string>(WORKFLOW_SCENARIOS[0].rawPrompt);
  const [destinationId, setDestinationId] = useState<DestinationId>(
    WORKFLOW_SCENARIOS[0].defaultDestinationId
  );
  const [decisionOverrides, setDecisionOverrides] = useState<Record<string, PolicyDecision>>({});
  const [inspectedEntityId, setInspectedEntityId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'inspector' | 'payload-diff'>('inspector');

  const evaluation = useMemo(
    () => evaluateWorkflowContext(rawPrompt, taskObjective, destinationId, decisionOverrides),
    [rawPrompt, taskObjective, destinationId, decisionOverrides]
  );


  // ---- Live backend verification (Render API) ----
  type ApiState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'ok'; data: AnalyzeResponse }
    | { status: 'error'; message: string };
  const [apiState, setApiState] = useState<ApiState>({ status: 'idle' });
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!rawPrompt.trim()) {
      setApiState({ status: 'idle' });
      return;
    }
    const controller = new AbortController();
    setApiState({ status: 'loading' });
    setSubmitMsg(null);
    const timer = setTimeout(() => {
      analyzeRemote(
        { rawPrompt, taskObjective, destinationId, decisionOverrides },
        controller.signal
      )
        .then((data) => setApiState({ status: 'ok', data }))
        .catch((err: unknown) => {
          if ((err as Error)?.name === 'AbortError') return;
          setApiState({
            status: 'error',
            message: (err as Error)?.message || 'Backend unreachable',
          });
        });
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [rawPrompt, taskObjective, destinationId, decisionOverrides]);

  const handleSubmitApproved = async () => {
    if (apiState.status !== 'ok') return;
    setSubmitMsg('Validating…');
    try {
      const res = await submitApprovedRemote({
        analysisId: apiState.data.analysisId,
        destinationId,
        expectedSanitizedPayloadSha256: apiState.data.sanitizedPayloadSha256,
      });
      setSubmitMsg(`Server response: ${res.status}`);
    } catch (err) {
      setSubmitMsg(`Rejected: ${(err as Error).message}`);
    }
  };

  const inspectedEntity: DetectedEntity | undefined = useMemo(() => {
    if (inspectedEntityId) {
      const found = evaluation.entities.find((e) => e.id === inspectedEntityId);
      if (found) return found;
    }
    return (
      evaluation.entities.find((e) => e.relevanceLevel === 'REQUIRED') ||
      evaluation.entities[0]
    );
  }, [evaluation.entities, inspectedEntityId]);

  const primaryAllowedEntity = useMemo(
    () =>
      evaluation.entities.find((e) => e.decision === 'ALLOW') ||
      evaluation.entities.find((e) => e.decision === 'REDACT'),
    [evaluation.entities]
  );

  const primaryBlockedEntity = useMemo(
    () =>
      evaluation.entities.find((e) => e.decision === 'BLOCK') ||
      evaluation.entities.find((e) => e.decision === 'REDACT'),
    [evaluation.entities]
  );

  const handleSelectScenario = (scenarioId: string) => {
    const found = WORKFLOW_SCENARIOS.find((s) => s.id === scenarioId);
    if (!found) return;
    setSelectedScenarioId(found.id);
    setTaskObjective(found.taskObjective);
    setRawPrompt(found.rawPrompt);
    setDestinationId(found.defaultDestinationId);
    setDecisionOverrides({});
    setInspectedEntityId(null);
  };

  const handleOverrideDecision = (entityId: string, decision: PolicyDecision) => {
    setDecisionOverrides((prev) => ({
      ...prev,
      [entityId]: decision,
    }));
    setInspectedEntityId(entityId);
  };

  const handleInjectSampleToken = (tokenSnippet: string) => {
    if (!rawPrompt.includes(tokenSnippet)) {
      setRawPrompt((prev) => `${prev.trim()} ${tokenSnippet}`);
    }
  };

  const activeRelevanceScore = inspectedEntity
    ? inspectedEntity.relevanceScore
    : evaluation.metrics.scopedRelevancePct;

  return (
    <section
      id="interactive-demo"
      aria-label="Interactive ContextGuard Policy Demonstration"
      className="bg-cosmic-obsidian py-20 md:py-28 border-b border-white/10 relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14">
        {/* Outer Dark Browser/System Frame matching 00:19-00:21 */}
        <div className="max-w-[1260px] mx-auto bg-[#1b1b19] p-2 sm:p-3 rounded-xs border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.65)]">
          {/* Top Bar inside Dark Frame */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141413] border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d94e34]/70" title="Boundary Close" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#d99b16]/70" title="Boundary Minimize" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#6e9b26]/70" title="Boundary Expand" />
            </div>

            {/* Segmented Mode Switcher matching [ ANTIMETAL | PRODUCTION ] */}
            <div className="flex items-center border border-white/15 p-0.5 bg-[#1c1c1a] rounded-xs">
              <button
                type="button"
                onClick={() => setViewMode('inspector')}
                className={`px-3 py-1 font-mono-tech text-[10px] tracking-[0.14em] uppercase transition-all rounded-xs cursor-pointer ${
                  viewMode === 'inspector'
                    ? 'bg-[#f4f3ef] text-[#141413] font-semibold shadow-xs'
                    : 'text-[#a09f99] hover:text-white'
                }`}
              >
                CONTEXTGUARD
              </button>
              <button
                type="button"
                onClick={() => setViewMode('payload-diff')}
                className={`px-3 py-1 font-mono-tech text-[10px] tracking-[0.14em] uppercase transition-all rounded-xs cursor-pointer ${
                  viewMode === 'payload-diff'
                    ? 'bg-[#f4f3ef] text-[#141413] font-semibold shadow-xs'
                    : 'text-[#a09f99] hover:text-white'
                }`}
              >
                OUTBOUND PAYLOAD
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.1em] text-[#a09f99]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6e9b26] animate-pulse" />
              <span>LIVE EVALUATION WORKSPACE</span>
            </div>
          </div>

          {/* Inner Light-Cream Workspace Surface matching 00:20-00:21 */}
          <div className="bg-[#f6f5f0] text-[#141413] grid grid-cols-1 lg:grid-cols-12">
            {/* LEFT 8 COLUMNS: Main Evaluation Dashboard */}
            <div className="lg:col-span-8 p-5 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#141413]/10">
              {/* Top Greeting & Scenario Bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#141413]/10">
                <div>
                  <h2 className="font-serif-editorial text-[26px] sm:text-[30px] leading-tight text-[#141413]">
                    Outbound Context Evaluation
                  </h2>
                  <p className="text-[12px] sm:text-[13px] text-[#686762] mt-1">
                    ContextGuard inspected{' '}
                    <span className="font-medium text-[#141413]">
                      {evaluation.metrics.totalDetected} sensitive entities
                    </span>{' '}
                    before transmission ·{' '}
                    <span className="text-[#4d7317] font-medium">
                      {evaluation.metrics.allowedCount} allowed
                    </span>{' '}
                    ·{' '}
                    <span className="text-[#b87d14] font-medium">
                      {evaluation.metrics.redactedCount} redacted
                    </span>{' '}
                    ·{' '}
                    <span className="text-[#D94E34] font-medium">
                      {evaluation.metrics.blockedCount} blocked
                    </span>
                  </p>
                </div>

                {/* Preset Scenario Selector Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {WORKFLOW_SCENARIOS.map((scen, idx) => (
                    <button
                      key={scen.id}
                      type="button"
                      onClick={() => handleSelectScenario(scen.id)}
                      className={`px-2.5 py-1 text-[11px] font-mono-tech transition-colors border cursor-pointer ${
                        selectedScenarioId === scen.id
                          ? 'bg-[#141413] text-[#f4f3ef] border-[#141413]'
                          : 'bg-[#eceae3] text-[#52514d] border-[#141413]/12 hover:border-[#141413]/35'
                      }`}
                    >
                      0{idx + 1}. {scen.title.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Approved 3-Panel Arrangement:
                  1. Full-width TASK RELEVANCE panel on top (warm ivory, slightly more spacious & prominent)
                  2. Equal-width ALLOWED (left, soft neutral) & BLOCKED (right, pale muted-coral) side-by-side below, stacked on mobile */}
              <div className="my-6 space-y-4">
                {/* 1. TASK RELEVANCE: Full-width top panel */}
                <div
                  data-testid="panel-task-relevance"
                  className="w-full bg-[#faf8f3] border border-[#141413]/12 border-t-2 border-t-[#141413]/60 rounded-md p-6 sm:p-7 shadow-[0_2px_10px_rgba(20,20,19,0.03)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono-tech text-[10px] tracking-[0.14em] uppercase text-[#686762] whitespace-nowrap shrink-0">
                      TASK RELEVANCE
                    </span>
                    <span className="font-mono-tech text-[10px] tracking-[0.1em] uppercase text-[#686762] truncate">
                      {inspectedEntity
                        ? `${inspectedEntity.value} · ${inspectedEntity.relevanceLevel}`
                        : 'SCOPED WORKFLOW CONTEXT'}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-serif-editorial text-[40px] sm:text-[46px] leading-none tracking-[-0.025em] text-[#141413]">
                      {activeRelevanceScore}%
                    </span>
                    <span className="font-mono-tech text-[10px] tracking-[0.1em] uppercase text-[#52514d]">
                      {inspectedEntity
                        ? `Task necessity (${evaluation.metrics.scopedRelevancePct}% prompt scoped)`
                        : 'Scoped task necessity'}
                    </span>
                  </div>

                  {/* Slim horizontal progress indicator */}
                  <div
                    className="mt-4 h-1.5 w-full bg-[#141413]/10 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={activeRelevanceScore}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Task relevance percentage"
                  >
                    <div
                      className="h-full bg-[#141413] rounded-full transition-all duration-300"
                      style={{ width: `${activeRelevanceScore}%` }}
                    />
                  </div>

                  {/* Short explanation beneath progress indicator */}
                  <p className="mt-4 text-[13px] sm:text-[14px] leading-[1.55] text-[#52514d]">
                    {inspectedEntity
                      ? inspectedEntity.relevanceRationale
                      : 'Evaluates semantic dependency between detected sensitive context and the stated task objective before checking destination permissions.'}
                  </p>
                </div>

                {/* 2 & 3. ALLOWED and BLOCKED: Side-by-side equal widths below on desktop/tablet, stacked vertically on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                  {/* 2. ALLOWED Panel (Left) */}
                  <div
                    data-testid="panel-allowed"
                    onClick={() => {
                      if (primaryAllowedEntity) {
                        setInspectedEntityId(primaryAllowedEntity.id);
                      }
                    }}
                    className="bg-[#efede7] border border-[#141413]/12 rounded-md p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-colors hover:border-[#141413]/25"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck
                            className="w-4 h-4 text-[#3f6a14] shrink-0"
                            aria-hidden="true"
                          />
                          <h3 className="font-serif-editorial text-[20px] sm:text-[22px] leading-tight text-[#141413]">
                            Allowed
                          </h3>
                        </div>
                        <span className="font-mono-tech text-[9px] tracking-[0.12em] uppercase text-[#3f6a14] font-semibold px-2 py-0.5 bg-[#3f6a14]/10 rounded-xs whitespace-nowrap">
                          POLICY PASSED
                        </span>
                      </div>

                      <p className="mt-3 text-[12px] sm:text-[13px] leading-[1.55] text-[#52514d]">
                        {evaluation.metrics.allowedCount > 0 && primaryAllowedEntity
                          ? `${primaryAllowedEntity.value} (${primaryAllowedEntity.relevanceScore}% relevant) is required for the task and authorized for ${evaluation.destination.name}.`
                          : `${evaluation.metrics.redactedCount} task-relevant span(s) permitted via structure-preserving tokens for ${evaluation.destination.name}.`}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#141413]/8 flex items-center justify-between gap-2 font-mono-tech text-[10px] text-[#686762]">
                      <span className="whitespace-nowrap">
                        {evaluation.metrics.allowedCount} authorized ·{' '}
                        {evaluation.metrics.redactedCount} redacted
                      </span>
                      <span className="text-[#3f6a14] truncate">
                        {evaluation.destination.trustBoundary}
                      </span>
                    </div>
                  </div>

                  {/* 3. BLOCKED Panel (Right) */}
                  <div
                    data-testid="panel-blocked"
                    onClick={() => {
                      if (primaryBlockedEntity) {
                        setInspectedEntityId(primaryBlockedEntity.id);
                      }
                    }}
                    className="bg-[#f4e8e4] border border-[#D94E34]/22 rounded-md p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-colors hover:border-[#D94E34]/35"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ShieldAlert
                            className="w-4 h-4 text-[#c8432b] shrink-0"
                            aria-hidden="true"
                          />
                          <h3 className="font-serif-editorial text-[20px] sm:text-[22px] leading-tight text-[#141413]">
                            Blocked
                          </h3>
                        </div>
                        <span className="font-mono-tech text-[9px] tracking-[0.12em] uppercase text-[#c8432b] font-semibold px-2 py-0.5 bg-[#c8432b]/10 rounded-xs whitespace-nowrap">
                          ACCESS DENIED
                        </span>
                      </div>

                      <p className="mt-3 text-[12px] sm:text-[13px] leading-[1.55] text-[#5a4540]">
                        {evaluation.metrics.blockedCount > 0 && primaryBlockedEntity
                          ? `${primaryBlockedEntity.value} (${primaryBlockedEntity.label}) is withheld at the boundary. High relevance never overrides an explicit authorization denial.`
                          : `Raw sensitive values are denied egress to ${evaluation.destination.name}; task relevance never overrides destination permission.`}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#D94E34]/15 flex items-center justify-between gap-2 font-mono-tech text-[10px] text-[#7a5850]">
                      <span className="truncate">
                        {evaluation.metrics.blockedCount} blocked raw ·{' '}
                        {evaluation.principleTriggered
                          ? 'Relevance ≠ Permission'
                          : 'Zero-trust guard'}
                      </span>
                      <span className="text-[#c8432b] whitespace-nowrap">Withheld</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Prompt, Task Objective & Target Boundary Controls */}
              <div className="mb-6 bg-[#efede7] border border-[#141413]/10 rounded-md p-4">
                {/* Target Boundary & Decisions Span Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-[#141413]/10">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <label
                      htmlFor="destination-select"
                      className="font-mono-tech text-[9px] tracking-[0.12em] uppercase text-[#686762]"
                    >
                      TARGET BOUNDARY
                    </label>
                    <select
                      id="destination-select"
                      data-lenis-prevent
                      value={destinationId}
                      onChange={(e) => setDestinationId(e.target.value as DestinationId)}
                      className="bg-[#e4e2db] border border-[#141413]/15 px-2.5 py-1 text-[11px] font-medium text-[#141413] rounded-xs cursor-pointer focus:outline-none"
                    >
                      {Object.values(DESTINATIONS).map((dest) => (
                        <option key={dest.id} value={dest.id}>
                          {dest.name}
                        </option>
                      ))}
                    </select>
                    <span className="font-mono-tech text-[9px] text-[#686762]">
                      ({evaluation.destination.trustBoundary})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono-tech text-[9px] tracking-[0.12em] uppercase text-[#686762]">
                      DECISIONS ({evaluation.metrics.totalDetected} SPANS)
                    </span>
                    <div className="flex items-center gap-1.5">
                      {evaluation.entities.map((ent) => (
                        <button
                          key={ent.id}
                          type="button"
                          onClick={() => setInspectedEntityId(ent.id)}
                          title={`${ent.value}: ${ent.decision}`}
                          className={`w-2.5 h-2.5 rounded-full transition-transform hover:scale-125 cursor-pointer ${
                            ent.decision === 'ALLOW'
                              ? 'bg-[#6E9B26]'
                              : ent.decision === 'REDACT'
                              ? 'bg-[#E5A01D]'
                              : 'bg-[#D94E34]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
                  <div className="sm:col-span-5">
                    <label
                      htmlFor="task-objective-input"
                      className="block font-mono-tech text-[9px] tracking-[0.12em] uppercase text-[#686762] mb-1"
                    >
                      STATED TASK OBJECTIVE
                    </label>
                    <input
                      id="task-objective-input"
                      type="text"
                      value={taskObjective}
                      onChange={(e) => setTaskObjective(e.target.value)}
                      className="w-full bg-[#f8f7f3] border border-[#141413]/15 px-2.5 py-1.5 text-[12px] text-[#141413] rounded-xs focus:outline-none focus:border-[#141413]"
                    />
                  </div>
                  <div className="sm:col-span-7">
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="raw-prompt-input"
                        className="font-mono-tech text-[9px] tracking-[0.12em] uppercase text-[#686762]"
                      >
                        OUTBOUND WORKFLOW PAYLOAD (EDITABLE)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInjectSampleToken('sk_live_51N9xYz7710aB')}
                          className="font-mono-tech text-[9px] text-[#D94E34] hover:underline cursor-pointer"
                        >
                          +Key
                        </button>
                        <span className="text-[#686762]">·</span>
                        <button
                          type="button"
                          onClick={() => handleInjectSampleToken('Project Obsidian ($19.4M)')}
                          className="font-mono-tech text-[9px] text-[#b87d14] hover:underline cursor-pointer"
                        >
                          +MNPI
                        </button>
                      </div>
                    </div>
                    <textarea
                      id="raw-prompt-input"
                      data-lenis-prevent
                      rows={2}
                      value={rawPrompt}
                      onChange={(e) => setRawPrompt(e.target.value)}
                      className="w-full bg-[#f8f7f3] border border-[#141413]/15 px-2.5 py-1.5 text-[12px] text-[#141413] leading-snug rounded-xs focus:outline-none focus:border-[#141413]"
                    />
                  </div>
                </div>

                {/* Principle Callout Banner inside Sandbox */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#141413]/10 text-[11px]">
                  <span className="text-[#52514d] font-medium">
                    {evaluation.principleSummary}
                  </span>
                  {Object.keys(decisionOverrides).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setDecisionOverrides({})}
                      className="flex items-center gap-1 font-mono-tech text-[10px] text-[#D94E34] hover:underline shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset overrides
                    </button>
                  )}
                </div>
              </div>

              {/* NEEDS YOUR DECISION — 2 Action Cards matching 00:20-00:21 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono-tech text-[10px] tracking-[0.14em] uppercase text-[#686762]">
                    POLICY EVALUATION CARDS ({evaluation.entities.length})
                  </span>
                  <span className="font-mono-tech text-[10px] text-[#686762]">
                    Click any card to inspect rule rationale →
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(() => {
                    const firstCard =
                      evaluation.entities.find(
                        (e) => e.decision === 'ALLOW' || e.decision === 'REDACT'
                      ) || evaluation.entities[0];
                    const secondCard =
                      evaluation.entities.find(
                        (e) => e.id !== firstCard?.id && e.decision === 'BLOCK'
                      ) || evaluation.entities.find((e) => e.id !== firstCard?.id);
                    const featuredCards = [firstCard, secondCard].filter(
                      (e): e is DetectedEntity => Boolean(e)
                    );
                    const cardsToRender =
                      featuredCards.length > 0 ? featuredCards : evaluation.entities.slice(0, 2);

                    return cardsToRender.map((entity) => {
                      const isSelected = inspectedEntity?.id === entity.id;
                      const isBlockedCard = entity.decision === 'BLOCK';
                      const isHardDenied = entity.defaultDecision === 'BLOCK';
                      return (
                        <div
                          key={entity.id}
                          onClick={() => setInspectedEntityId(entity.id)}
                          className={`relative p-4 sm:p-5 border rounded-md transition-colors cursor-pointer ${
                            isBlockedCard
                              ? isSelected
                                ? 'bg-[#ece0dc] border-[#D94E34]/30'
                                : 'bg-[#f4e8e4] border-[#D94E34]/20 hover:border-[#D94E34]/30'
                              : isSelected
                              ? 'bg-[#e8e6de] border-[#141413]/25'
                              : 'bg-[#efede7] border-[#141413]/12 hover:border-[#141413]/20'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 font-mono-tech text-[9px] tracking-[0.1em] uppercase">
                            <span
                              className={
                                isBlockedCard
                                  ? 'text-[#a33925] font-semibold'
                                  : 'text-[#52514d] font-semibold'
                              }
                            >
                              {entity.decision === 'ALLOW'
                                ? 'ALLOWED'
                                : entity.decision === 'BLOCK'
                                ? 'BLOCKED'
                                : 'REDACTED'}{' '}
                              · {entity.category.replace('_', ' ')}
                            </span>
                            <span className="text-[#686762]">
                              Relevance: {entity.relevanceScore}% ({entity.relevanceLevel})
                            </span>
                          </div>

                          <div className="mt-2 font-serif-editorial text-[17px] text-[#141413] truncate">
                            {entity.value}
                          </div>
                          <p className="mt-1 text-[11px] text-[#686762] line-clamp-1">
                            {entity.relevanceRationale}
                          </p>

                          {/* Action Buttons matching [ ✓ Approve ] [ View plan ] in 00:20-00:21 */}
                          <div className="mt-3.5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOverrideDecision(entity.id, 'REDACT');
                              }}
                              className={`px-2.5 py-1 rounded-xs font-mono-tech text-[10px] flex items-center gap-1 transition-colors cursor-pointer ${
                                entity.decision === 'REDACT'
                                  ? 'bg-[#141413] text-[#f4f3ef]'
                                  : 'bg-[#e2e0d8] text-[#141413] hover:bg-[#d5d3cb]'
                              }`}
                            >
                              {entity.decision === 'REDACT' && <Check className="w-3 h-3" />}
                              Redact
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOverrideDecision(entity.id, 'BLOCK');
                              }}
                              className={`px-2.5 py-1 rounded-xs font-mono-tech text-[10px] flex items-center gap-1 transition-colors cursor-pointer ${
                                entity.decision === 'BLOCK'
                                  ? 'bg-[#D94E34] text-white'
                                  : 'bg-[#e2e0d8] text-[#141413] hover:bg-[#d5d3cb]'
                              }`}
                            >
                              {entity.decision === 'BLOCK' && <ShieldAlert className="w-3 h-3" />}
                              Block
                            </button>

                            <button
                              type="button"
                              disabled={isHardDenied}
                              title={
                                isHardDenied
                                  ? 'Explicit destination authorization denial cannot be overridden to Allow'
                                  : 'Allow entity'
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isHardDenied) {
                                  handleOverrideDecision(entity.id, 'ALLOW');
                                }
                              }}
                              className={`px-2.5 py-1 rounded-xs font-mono-tech text-[10px] transition-colors ${
                                isHardDenied
                                  ? 'bg-[#e2e0d8]/60 text-[#686762]/60 cursor-not-allowed line-through'
                                  : entity.decision === 'ALLOW'
                                  ? 'bg-[#4d7317] text-white cursor-pointer'
                                  : 'bg-[#e2e0d8] text-[#141413] hover:bg-[#d5d3cb] cursor-pointer'
                              }`}
                            >
                              {isHardDenied ? 'Deny Locked' : 'Allow'}
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Live backend verification */}
              <div className="mb-4 border border-[#141413]/15 bg-[#efede7] px-3 py-2.5 text-[11px] font-mono-tech text-[#141413]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="uppercase tracking-[0.14em] text-[10px] text-[#686762]">
                    Backend verification · {API_BASE_URL.replace(/^https?:\/\//, '')}
                  </span>
                  <span
                    className={
                      apiState.status === 'ok'
                        ? 'text-[#3e5e10] font-semibold'
                        : apiState.status === 'error'
                        ? 'text-[#a33925] font-semibold'
                        : 'text-[#686762]'
                    }
                  >
                    {apiState.status === 'ok' && 'LIVE · VERIFIED'}
                    {apiState.status === 'loading' && 'CHECKING…'}
                    {apiState.status === 'error' && 'API UNREACHABLE (local preview shown)'}
                    {apiState.status === 'idle' && 'IDLE'}
                  </span>
                </div>
                {apiState.status === 'ok' && (
                  <div className="mt-2 space-y-1 break-all">
                    <div>
                      Server action: <b>{apiState.data.overallAction}</b>
                      {apiState.data.overallAction !== evaluation.overallAction && (
                        <span className="text-[#a33925]"> (differs from local preview)</span>
                      )}
                    </div>
                    <div>SHA-256: {apiState.data.sanitizedPayloadSha256}</div>
                    <div>Analysis ID: {apiState.data.analysisId}</div>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleSubmitApproved}
                        disabled={!apiState.data.canSubmit}
                        className="px-2.5 py-1 bg-[#141413] text-[#f4f3ef] uppercase tracking-[0.12em] text-[10px] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Validate submission
                      </button>
                      {!apiState.data.canSubmit && (
                        <span className="text-[#a33925]">Blocked by policy — outbound halted</span>
                      )}
                      {submitMsg && <span>{submitMsg}</span>}
                    </div>
                  </div>
                )}
                {apiState.status === 'error' && (
                  <div className="mt-1 text-[#686762]">
                    {apiState.message}. The free Render instance may be waking up — it retries on your next edit.
                  </div>
                )}
              </div>

              {/* Bottom Table / Sanitized Payload Preview matching TRIAGE rows in 00:20-00:21 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-tech text-[10px] tracking-[0.14em] uppercase text-[#686762]">
                    {viewMode === 'payload-diff'
                      ? 'SANITIZED OUTBOUND PAYLOAD PREVIEW'
                      : 'ALL DETECTED CONTEXT SPANS & DECISIONS'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setViewMode(viewMode === 'inspector' ? 'payload-diff' : 'inspector')
                    }
                    className="font-mono-tech text-[10px] text-[#141413] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    {viewMode === 'inspector' ? 'View Sanitized Payload' : 'View Entity Rows'}
                  </button>
                </div>

                {viewMode === 'inspector' ? (
                  <div className="divide-y divide-[#141413]/10 border-t border-b border-[#141413]/10">
                    {evaluation.entities.map((ent) => (
                      <div
                        key={ent.id}
                        onClick={() => setInspectedEntityId(ent.id)}
                        className={`py-2.5 px-2 flex flex-wrap items-center justify-between gap-2 text-[12px] cursor-pointer transition-colors ${
                          inspectedEntity?.id === ent.id
                            ? 'bg-[#e8e6de]'
                            : 'hover:bg-[#efede7]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`font-mono-tech text-[9px] px-1.5 py-0.5 uppercase tracking-wider rounded-xs ${
                              ent.decision === 'BLOCK'
                                ? 'bg-[#D94E34]/15 text-[#a33925] font-semibold'
                                : ent.decision === 'REDACT'
                                ? 'bg-[#E5A01D]/20 text-[#94620a] font-semibold'
                                : 'bg-[#6E9B26]/20 text-[#3e5e10] font-semibold'
                            }`}
                          >
                            {ent.decision}
                          </span>
                          <span className="font-mono-tech text-[11px] font-medium text-[#141413] truncate">
                            {ent.value}
                          </span>
                          <span className="text-[#686762] text-[11px] hidden sm:inline">
                            — {ent.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 font-mono-tech text-[10px]">
                          <span className="text-[#686762]">
                            Rel: {ent.relevanceScore}% ({ent.relevanceLevel})
                          </span>
                          <span className="text-[#141413] underline">Inspect ›</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#141413] text-[#f4f3ef] p-4 font-mono-tech text-[11px] leading-relaxed rounded-md">
                    <div className="text-[9px] tracking-[0.12em] uppercase text-[#a09f99] mb-1.5 flex items-center justify-between">
                      <span>TRANSMITTED TO: {evaluation.destination.name}</span>
                      <span className="text-[#6E9B26]">STRUCTURE-PRESERVED</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-[#e5e4de]">
                      {evaluation.sanitizedPrompt}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT 4 COLUMNS: Policy Explanation Inspector matching "Ask anything about your recent deploys" in 00:20-00:21 */}
            <div className="lg:col-span-4 p-5 sm:p-8 bg-[#faf9f5] flex flex-col justify-between">
              <div>
                <div className="text-center pb-6 border-b border-[#141413]/10">
                  <h3 className="font-serif-editorial text-[22px] sm:text-[24px] leading-snug text-[#141413]">
                    Transparent policy explanations
                  </h3>
                  <p className="mt-2 text-[12px] text-[#686762] leading-relaxed">
                    Every allow, redact, or block decision includes a verifiable
                    explanation of sensitivity, task relevance, and destination
                    authorization.
                  </p>
                </div>

                {/* Selected Entity Explanation Trace */}
                {inspectedEntity ? (
                  <div className="mt-6 space-y-3.5">
                    <div className="bg-[#f1efe9] border border-[#141413]/10 rounded-md p-4">
                      <div className="flex items-center justify-between font-mono-tech text-[9px] tracking-[0.12em] uppercase text-[#686762] mb-1.5">
                        <span>INSPECTED ENTITY</span>
                        <span>{inspectedEntity.policyRuleId}</span>
                      </div>
                      <div className="font-mono-tech text-[13px] font-semibold text-[#141413] break-all">
                        {inspectedEntity.value}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 font-mono-tech text-[10px]">
                        <span className="text-[#686762]">
                          Sensitivity:{' '}
                          <strong className="text-[#141413]">
                            {inspectedEntity.sensitivity}
                          </strong>
                        </span>
                        <span>·</span>
                        <span className="text-[#686762]">
                          Decision:{' '}
                          <strong
                            className={
                              inspectedEntity.decision === 'BLOCK'
                                ? 'text-[#a33925]'
                                : inspectedEntity.decision === 'ALLOW'
                                ? 'text-[#4d7317]'
                                : 'text-[#141413]'
                            }
                          >
                            {inspectedEntity.decision}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* 3 Structured Inspector Panels */}
                    <div className="space-y-3">
                      {/* Inspector Panel 1: Task Relevance */}
                      <div className="bg-[#faf8f3] border border-[#141413]/12 rounded-md p-5">
                        <div className="flex items-center justify-between font-mono-tech text-[9px] tracking-[0.12em] uppercase text-[#686762]">
                          <span>TASK RELEVANCE</span>
                          <span>{inspectedEntity.relevanceLevel}</span>
                        </div>

                        <div className="mt-2.5 flex items-baseline justify-between gap-2">
                          <span className="font-serif-editorial text-[28px] sm:text-[32px] leading-none text-[#141413]">
                            {inspectedEntity.relevanceScore}%
                          </span>
                          <span className="font-mono-tech text-[10px] text-[#686762]">
                            Task necessity score
                          </span>
                        </div>

                        <div
                          className="mt-3 h-1.5 w-full bg-[#141413]/10 rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={inspectedEntity.relevanceScore}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full bg-[#141413] rounded-full transition-all duration-300"
                            style={{ width: `${inspectedEntity.relevanceScore}%` }}
                          />
                        </div>

                        <p className="mt-3.5 text-[12px] text-[#52514d] leading-relaxed">
                          {inspectedEntity.relevanceRationale}
                        </p>
                      </div>

                      {/* Inspector Panel 2: Allowed / Blocked Decision Panel */}
                      <div
                        className={`border rounded-md p-4 ${
                          inspectedEntity.decision === 'BLOCK'
                            ? 'bg-[#f4e8e4] border-[#D94E34]/22'
                            : 'bg-[#efede7] border-[#141413]/12'
                        }`}
                      >
                        <div
                          className={`font-mono-tech text-[9px] tracking-[0.12em] uppercase flex items-center gap-1.5 ${
                            inspectedEntity.decision === 'BLOCK'
                              ? 'text-[#c8432b]'
                              : inspectedEntity.decision === 'ALLOW'
                              ? 'text-[#3f6a14]'
                              : 'text-[#686762]'
                          }`}
                        >
                          {inspectedEntity.decision === 'BLOCK' ? (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          ) : inspectedEntity.decision === 'ALLOW' ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          {inspectedEntity.decision === 'ALLOW'
                            ? 'ALLOWED · POLICY PASSED'
                            : inspectedEntity.decision === 'BLOCK'
                            ? 'BLOCKED · ACCESS DENIED'
                            : 'REDACTED · POLICY RATIONALE'}
                        </div>
                        <p className="mt-2 text-[12px] text-[#141413] leading-relaxed">
                          {inspectedEntity.explanation}
                        </p>
                      </div>

                      {/* Inspector Panel 3: Destination Authorization Posture */}
                      <div className="bg-[#efede7] border border-[#141413]/12 rounded-md p-4">
                        <div className="font-mono-tech text-[9px] tracking-[0.12em] uppercase text-[#686762]">
                          DESTINATION AUTHORIZATION POSTURE
                        </div>
                        <p className="mt-2 text-[12px] text-[#52514d] leading-relaxed">
                          <strong>{evaluation.destination.name}</strong>:{' '}
                          {evaluation.destination.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-[13px] text-[#686762]">
                    No sensitive entities detected in the current prompt.
                  </div>
                )}
              </div>

              {/* Bottom Destination Quick-Comparison Bar matching the chat input box in 00:20-00:21 */}
              <div className="mt-6 pt-4 border-t border-[#141413]/10">
                <div className="bg-[#efede7] border border-[#141413]/15 p-3">
                  <div className="font-mono-tech text-[9px] tracking-[0.1em] uppercase text-[#686762] mb-2">
                    TEST DESTINATION SWITCHING
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#141413] truncate">
                      Dest: {evaluation.destination.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const order: DestinationId[] = [
                          'external-llm',
                          'mcp-plugin',
                          'support-crm',
                          'slack-bot',
                        ];
                        const next =
                          order[(order.indexOf(destinationId) + 1) % order.length];
                        setDestinationId(next);
                      }}
                      className="px-2.5 py-1 bg-[#141413] text-[#f4f3ef] font-mono-tech text-[10px] flex items-center gap-1 shrink-0 hover:bg-[#2b2b29] cursor-pointer"
                    >
                      Cycle Endpoint
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
