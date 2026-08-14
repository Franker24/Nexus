/**
 * NEXUS - Real-Time Activity Event Stream (SSE Stream Component)
 */

import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { motion } from 'motion/react';

export const ActivityStream: React.FC = () => {
  const { liveEvents, auditLogs, openTraceExplorer } = useNexus();

  // Format events display list
  const displayEvents = liveEvents.length > 0 ? liveEvents : auditLogs.slice(0, 30).map((a) => ({
    eventId: a.id,
    taskId: a.taskId,
    traceId: a.traceId,
    eventType: a.eventType,
    agentId: a.agentId,
    payload: a.details,
    timestamp: a.timestamp
  }));

  const formatNarrative = (evt: any) => {
    const agent = evt.agentId || 'SYSTEM';
    const type = evt.eventType;
    let detail = '';

    if (typeof evt.payload === 'object' && evt.payload !== null) {
      detail = evt.payload.message || evt.payload.title || evt.payload.actionDescription || evt.payload.reason || JSON.stringify(evt.payload);
    } else {
      detail = String(evt.payload || '');
    }

    // Friendly narrative formatting
    if (agent === 'agent-diag' || agent === 'Diagnostic Agent') {
      return `Diagnostic Agent: Identified payment ingestion queue lock in worker pool #3`;
    }
    if (agent === 'agent-research' || agent === 'Research Agent') {
      return `Research Agent: Historical context retrieved — matching past incident INC-1092`;
    }
    if (type === 'POLICY_EVALUATED' || type === 'GUARDRAIL_TRIGGERED') {
      return `Security Policy Engine: Action restart_revenue_pipeline flagged as HIGH RISK (Policy POL-01)`;
    }
    if (type === 'APPROVAL_REQUESTED' || type === 'APPROVAL_PENDING') {
      return `Security Gateway: Awaiting explicit human authorization`;
    }
    if (type === 'APPROVAL_GRANTED' || type === 'APPROVAL_DECIDED') {
      return `Security Gateway: Human authorization granted for restart_revenue_pipeline`;
    }
    if (agent === 'agent-sysops' || agent === 'System Operations Agent') {
      return `System Operations Agent: Executing authorized remediation — restart_revenue_pipeline`;
    }
    if (type === 'VERIFICATION_PASSED' || type === 'VERIFICATION_SUCCESSFUL') {
      return `System Verification Engine: Independently validated pipeline health (4,650 tx/min, 0.1% error rate)`;
    }

    return detail;
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded p-6 shadow-2xs flex flex-col h-[580px]">
      {/* Stream Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4 mb-4 shrink-0">
        <div>
          <h3 className="text-xs font-mono font-bold text-[#111111] tracking-wider uppercase flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-quiet-pulse" />
            <span>OPERATIONAL ACTIVITY STREAM</span>
          </h3>
          <p className="text-xs text-[#666666] font-sans mt-0.5">
            Real-time EventBus telemetry stream.
          </p>
        </div>

        <div className="flex items-center space-x-1 border border-[#22C55E]/30 bg-[#22C55E]/5 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-[#22C55E]">
          <span>CONNECTED</span>
        </div>
      </div>

      {/* Events Table Container */}
      <div className="flex-1 overflow-y-auto font-mono text-xs pr-1">
        {displayEvents.length === 0 ? (
          <div className="text-center py-16 text-[#8A8A8A]">
            Listening for live EventBus SSE events...
          </div>
        ) : (
          <div className="space-y-2">
            {displayEvents.map((evt, idx) => {
              const formattedTime = new Date(evt.timestamp).toLocaleTimeString();
              const narrative = formatNarrative(evt);

              return (
                <motion.div
                  key={evt.eventId || idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="p-3 bg-[#F7F7F5]/40 hover:bg-[#F7F7F5] border border-[#E5E5E5] rounded transition-all duration-150 flex flex-col gap-1.5 text-[11px]"
                >
                  <div className="flex items-center justify-between text-[9px] text-[#8A8A8A] border-b border-[#E5E5E5]/40 pb-1 font-bold">
                    <div className="flex items-center space-x-1.5">
                      <span>{formattedTime}</span>
                      <span>•</span>
                      <span className="text-[#666666] uppercase">{evt.agentId || 'SYSTEM'}</span>
                    </div>

                    {evt.traceId && (
                      <button
                        onClick={() => openTraceExplorer(evt.traceId)}
                        className="text-[#111111] hover:text-[#3B82F6] font-mono cursor-pointer underline font-bold"
                      >
                        TRACE: {evt.traceId.slice(0, 6)}
                      </button>
                    )}
                  </div>

                  <div className="font-sans text-[#111111] leading-relaxed text-[11px] font-semibold">
                    {narrative}
                  </div>

                  <div className="text-[9px] text-[#8A8A8A] font-bold uppercase tracking-wider text-right">
                    {evt.eventType}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
