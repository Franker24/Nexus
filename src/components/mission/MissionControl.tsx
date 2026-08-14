/**
 * NEXUS - Mission Control Primary Screen
 */

import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { SystemOverview } from './SystemOverview';
import { IncidentPanel } from './IncidentPanel';
import { GuidedStoryPipeline } from './GuidedStoryPipeline';
import { AgentFleetGrid } from '../agents/AgentFleetGrid';
import { WorkflowInspector } from '../workflow/WorkflowInspector';
import { ApprovalCenter } from '../approvals/ApprovalCenter';
import { ActivityStream } from '../activity/ActivityStream';
import { IncidentReportModal } from '../reports/IncidentReportModal';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const MissionControl: React.FC = () => {
  const { activeTask, pendingApprovals, openTraceExplorer } = useNexus();

  const isAwaitingApproval = activeTask?.status === 'AWAITING_APPROVAL' || pendingApprovals.length > 0;
  const isCompleted = activeTask?.status === 'COMPLETED';

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* 1. System Overview KPIs */}
      <SystemOverview />

      {/* 2. Guided 8-Phase Lifecycle Pipeline */}
      <GuidedStoryPipeline />

      {/* 3. Active Incident & Telemetry Panel */}
      <IncidentPanel />

      {/* Prominent Approval Gateway Alert when Awaiting Approval */}
      {isAwaitingApproval && (
        <div id="mission-approval-banner" className="animate-fade-in">
          <ApprovalCenter />
        </div>
      )}

      {/* Section 22: Final Visual Moment Completion Banner when COMPLETED */}
      {isCompleted && activeTask && (
        <div className="bg-white border-2 border-[#111111] rounded p-6 shadow-sm space-y-4 font-mono text-xs animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E5] pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              <div>
                <span className="font-bold text-sm text-[#111111] uppercase tracking-wide block">
                  NEXUS — AUTONOMOUS OPERATIONS COMPLETE
                </span>
                <span className="text-xs text-[#666666] font-sans block">
                  Revenue pipeline successfully restored to nominal operating performance.
                </span>
              </div>
            </div>

            <button
              onClick={() => openTraceExplorer(activeTask.traceId)}
              className="px-3.5 py-1.5 bg-[#111111] hover:bg-[#242424] text-white rounded font-bold cursor-pointer transition-colors flex items-center space-x-1.5 text-xs"
            >
              <span>INSPECT AUDIT TRACE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-sans">
            <div className="flex items-center space-x-2 p-2 bg-[#F7F7F5] border border-[#E5E5E5] rounded">
              <span className="text-[#22C55E] font-bold">✓</span>
              <span className="text-[#111111] font-medium">Root cause identified</span>
            </div>

            <div className="flex items-center space-x-2 p-2 bg-[#F7F7F5] border border-[#E5E5E5] rounded">
              <span className="text-[#22C55E] font-bold">✓</span>
              <span className="text-[#111111] font-medium">Historical context retrieved</span>
            </div>

            <div className="flex items-center space-x-2 p-2 bg-[#F7F7F5] border border-[#E5E5E5] rounded">
              <span className="text-[#22C55E] font-bold">✓</span>
              <span className="text-[#111111] font-medium">High-risk action governed</span>
            </div>

            <div className="flex items-center space-x-2 p-2 bg-[#F7F7F5] border border-[#E5E5E5] rounded">
              <span className="text-[#22C55E] font-bold">✓</span>
              <span className="text-[#111111] font-medium">Human authorization received</span>
            </div>

            <div className="flex items-center space-x-2 p-2 bg-[#F7F7F5] border border-[#E5E5E5] rounded">
              <span className="text-[#22C55E] font-bold">✓</span>
              <span className="text-[#111111] font-medium">Remediation executed</span>
            </div>

            <div className="flex items-center space-x-2 p-2 bg-[#F7F7F5] border border-[#E5E5E5] rounded">
              <span className="text-[#22C55E] font-bold">✓</span>
              <span className="text-[#111111] font-medium">Recovery independently verified</span>
            </div>

            <div className="flex items-center space-x-2 p-2 bg-[#F7F7F5] border border-[#E5E5E5] rounded col-span-1 sm:col-span-2">
              <span className="text-[#22C55E] font-bold">✓</span>
              <span className="text-[#111111] font-medium">
                Audit trail generated — Trace: <strong className="font-mono text-[#111111] underline">{activeTask.traceId}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Dashboard Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols on large screens): Workflow & Agent Fleet & Post-Mortem Report */}
        <div className="lg:col-span-8 space-y-6">
          {/* Connected Workflow State Machine */}
          <WorkflowInspector />

          {/* Post-Mortem Report when task is COMPLETED */}
          {isCompleted && <IncidentReportModal />}

          {/* Agent Fleet Grid */}
          <AgentFleetGrid />
        </div>

        {/* Right Column (4 cols on large screens): SSE Activity Stream */}
        <div className="lg:col-span-4">
          <ActivityStream />
        </div>
      </div>
    </div>
  );
};
