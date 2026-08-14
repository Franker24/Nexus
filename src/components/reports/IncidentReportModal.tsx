/**
 * NEXUS - Post-Mortem Incident Report View Component
 */

import React from 'react';
import { useNexus } from '../../context/NexusContext';

export const IncidentReportModal: React.FC = () => {
  const { activeTask, activeMessages } = useNexus();

  if (!activeTask || activeTask.status !== 'COMPLETED') {
    return null;
  }

  // Find report message from Reporting Agent if present
  const reportMessage = activeMessages.find((m) => m.type === 'report' || m.fromAgentId === 'reporting-agent');
  const reportPayload = reportMessage?.payload || {};

  return (
    <div className="bg-white border border-[#E5E5E5] rounded p-6 shadow-2xs font-mono text-xs my-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider">
              AUTONOMOUS POST-MORTEM INCIDENT REPORT
            </span>
            <span className="text-[10px] text-[#8A8A8A] bg-[#F7F7F5] px-2 py-0.5 rounded border border-[#E5E5E5]">
              {activeTask.traceId}
            </span>
          </div>
          <h3 className="text-base font-bold text-[#111111] mt-1 font-sans">
            {activeTask.title}: Final Recovery Audit
          </h3>
        </div>

        <span className="px-2.5 py-1 rounded bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 text-xs font-bold uppercase">
          STATUS: RESOLVED
        </span>
      </div>

      {/* Report Sections */}
      <div className="mt-5 space-y-4">
        {/* Executive Summary */}
        <div className="bg-[#F7F7F5] p-4 rounded border border-[#E5E5E5]">
          <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
            1. EXECUTIVE SUMMARY
          </h4>
          <p className="text-[#666666] leading-relaxed font-sans text-xs">
            {reportPayload.summary ||
              'Revenue Pipeline Ingestion Stall INC-2048 was automatically detected, investigated, and remediated by the NEXUS Autonomous Agent Fleet. The Diagnostic Agent identified queue lockup caused by corrupted worker state. The Research Agent retrieved precedent INC-1987. The Security Agent verified policy pol-01 and requested human authorization. Upon operator approval, the Operations Agent executed pipeline restart, and the Verification Agent confirmed complete system recovery.'}
          </p>
        </div>

        {/* Root Cause & Historical Precedent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#F7F7F5] p-4 rounded border border-[#E5E5E5]">
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              2. ROOT CAUSE ANALYSIS
            </h4>
            <p className="text-[#666666] leading-relaxed font-sans text-xs">
              Corrupted worker buffer state on <code className="text-[#111111] font-mono font-bold">rev-pipe-prod-01</code> caused thread starvation and locked 18,420 pending transaction chunks, resulting in an 87% error rate and 0 tx/min ingestion rate.
            </p>
          </div>

          <div className="bg-[#F7F7F5] p-4 rounded border border-[#E5E5E5]">
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              3. ORGANIZATIONAL MEMORY PRECEDENT
            </h4>
            <p className="text-[#666666] leading-relaxed font-sans text-xs">
              Retrieved episodic memory entry for <code className="text-[#111111] font-mono font-bold">INC-1987</code> (94% match). Previous resolution verified that flushing stale thread locks and restarting pipeline worker pools safely recovers state without transaction loss.
            </p>
          </div>
        </div>

        {/* Governance & Verification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#F7F7F5] p-4 rounded border border-[#E5E5E5]">
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              4. GOVERNANCE & APPROVAL AUDIT
            </h4>
            <ul className="space-y-1 text-[#666666] font-sans text-xs">
              <li>• Policy Rule: <strong className="font-mono text-[#111111]">pol-01 (High Risk Pipeline Restart)</strong></li>
              <li>• Decision: <strong className="font-mono text-[#22C55E]">HUMAN AUTHORIZATION GRANTED</strong></li>
              <li>• Decided By: <strong className="font-mono text-[#111111]">Security Operator</strong></li>
              <li>• Audit Event Trace: <strong className="font-mono text-[#8A8A8A]">{activeTask.traceId}</strong></li>
            </ul>
          </div>

          <div className="bg-[#F7F7F5] p-4 rounded border border-[#E5E5E5]">
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              5. RECOVERY VERIFICATION METRICS
            </h4>
            <ul className="space-y-1 text-[#666666] font-sans text-xs">
              <li>• Ingestion Processing Rate: <strong className="font-mono text-[#22C55E]">4,650 tx/min</strong> (Healthy)</li>
              <li>• System Error Rate: <strong className="font-mono text-[#22C55E]">0.1%</strong> (Target: &lt;1.0%)</li>
              <li>• Backlog Queue Depth: <strong className="font-mono text-[#22C55E]">0 locked chunks</strong></li>
              <li>• Telemetry Status: <strong className="font-mono text-[#22C55E]">HEALTHY</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

