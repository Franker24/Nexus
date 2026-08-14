/**
 * NEXUS - Enterprise Audit Trail & Trace Explorer View
 */

import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext';
import { Search, X } from 'lucide-react';
import { AuditEvent } from '../../types/nexus';
import { motion, AnimatePresence } from 'motion/react';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useNexus();
  const [searchTraceId, setSearchTraceId] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [inspectEvent, setInspectEvent] = useState<AuditEvent | null>(null);

  const filteredLogs = auditLogs.filter((evt) => {
    const matchesTrace =
      !searchTraceId ||
      evt.traceId.toLowerCase().includes(searchTraceId.toLowerCase()) ||
      evt.taskId.toLowerCase().includes(searchTraceId.toLowerCase()) ||
      evt.actor.toLowerCase().includes(searchTraceId.toLowerCase());

    const matchesType = selectedEventType === 'all' || evt.eventType === selectedEventType;

    return matchesTrace && matchesType;
  });

  const activeEvent = inspectEvent || filteredLogs[0] || null;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E5] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#111111] tracking-wider uppercase">
            ENTERPRISE AUDIT TRAIL & TRACE EXPLORER
          </h2>
          <p className="text-xs text-[#666666] mt-1 font-sans">
            Immutable, cryptographically verifiable operational event log linked by global execution Trace IDs.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by Trace ID or Actor..."
              value={searchTraceId}
              onChange={(e) => setSearchTraceId(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-white border border-[#E5E5E5] rounded text-xs text-[#111111] outline-none focus:border-[#111111] w-64"
            />
          </div>

          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#E5E5E5] rounded text-xs text-[#111111] outline-none focus:border-[#111111] cursor-pointer"
          >
            <option value="all">ALL EVENT TYPES</option>
            <option value="task.created">TASK CREATED</option>
            <option value="agent.started">AGENT STARTED</option>
            <option value="policy.evaluated">POLICY EVALUATED</option>
            <option value="approval.requested">APPROVAL REQUESTED</option>
            <option value="approval.approved">APPROVAL APPROVED</option>
            <option value="action.executed">ACTION EXECUTED</option>
            <option value="verification.completed">VERIFICATION COMPLETED</option>
            <option value="report.generated">REPORT GENERATED</option>
          </select>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Audit Table */}
        <div className="lg:col-span-7 bg-white border border-[#E5E5E5] rounded overflow-hidden shadow-2xs self-start">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F5] text-[#8A8A8A] border-b border-[#E5E5E5] text-[10px] uppercase tracking-wider font-mono select-none">
                <tr>
                  <th className="p-3 font-semibold">TIMESTAMP</th>
                  <th className="p-3 font-semibold">EVENT TYPE</th>
                  <th className="p-3 font-semibold">ACTOR</th>
                  <th className="p-3 font-semibold">STATUS</th>
                  <th className="p-3 font-semibold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-[#111111] font-mono">
                {filteredLogs.map((log) => {
                  const isSelected = inspectEvent?.id === log.id;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setInspectEvent(log)}
                      className={`hover:bg-[#F7F7F5] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#F7F7F5] font-semibold' : ''
                      }`}
                    >
                      <td className="p-3 text-[#8A8A8A] text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3 font-bold text-[#111111] uppercase text-[11px]">
                        {log.eventType}
                      </td>
                      <td className="p-3 text-[#666666] text-[11px] font-bold">
                        {log.actor}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                          log.status === 'SUCCESS' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30' : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`text-[10px] font-bold underline ${
                          isSelected ? 'text-[#3B82F6]' : 'text-[#111111]'
                        }`}>
                          SELECT
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Verifiable Event Log Inspector */}
        <div className="lg:col-span-5 bg-white border border-[#E5E5E5] rounded p-6 shadow-2xs space-y-6 self-start">
          {activeEvent ? (
            <div className="space-y-6 font-mono text-xs">
              <div className="border-b border-[#E5E5E5] pb-4">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] text-[#111111] font-mono text-[10px] uppercase font-bold">
                    EVENT SOURCE: {activeEvent.actor}
                  </span>
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                    activeEvent.status === 'SUCCESS' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30' : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                  }`}>
                    {activeEvent.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#111111] mt-2 uppercase tracking-tight font-mono select-all">
                  {activeEvent.eventType}
                </h3>
              </div>

              <div className="space-y-3 text-[11px]">
                <div className="grid grid-cols-2 gap-4 border-b border-[#E5E5E5] pb-3">
                  <div>
                    <span className="text-[#8A8A8A] block uppercase font-bold text-[9px]">TIMESTAMP</span>
                    <span className="text-[#111111] font-bold mt-0.5 block">{new Date(activeEvent.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#8A8A8A] block uppercase font-bold text-[9px]">TASK REF ID</span>
                    <span className="text-[#111111] font-mono font-bold mt-0.5 block select-all text-[10px] truncate" title={activeEvent.taskId}>{activeEvent.taskId.slice(0, 12)}...</span>
                  </div>
                </div>

                <div className="border-b border-[#E5E5E5] pb-3">
                  <span className="text-[#8A8A8A] block uppercase font-bold text-[9px]">GLOBAL EXECUTION TRACE ID</span>
                  <span className="text-[#111111] font-mono font-bold mt-1 block select-all text-[10px] bg-[#F7F7F5] border border-[#E5E5E5] px-2 py-1 rounded" title={activeEvent.traceId}>
                    {activeEvent.traceId}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#8A8A8A] font-bold uppercase block mb-1.5">CRYPTOGRAPHIC VERIFICATION BLOCK (JSON)</span>
                <pre className="p-4 bg-[#111111] text-[#A3A3A3] border border-[#222222] rounded text-[10px] leading-relaxed whitespace-pre-wrap max-h-[340px] overflow-y-auto font-mono">
                  {JSON.stringify(activeEvent, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center font-mono text-[#8A8A8A]">
              <span>SELECT AN EVENT ROW TO VIEW IMMUTABLE METADATA LOGS</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

