/**
 * NEXUS - Dedicated Workflows View
 */

import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { WorkflowInspector } from './WorkflowInspector';

export const WorkflowInspectorView: React.FC = () => {
  const { tasks, selectTask, activeTask, activeWorkflow, selectedNodeId } = useNexus();

  const activeNodes = activeWorkflow?.nodes || [];
  const selectedNode = activeNodes.find((n) => n.id === selectedNodeId) || activeNodes[0] || null;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-mono text-xs">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#111111] tracking-wider uppercase">
            WORKFLOW STATE MACHINE ORCHESTRATION
          </h2>
          <p className="text-xs text-[#666666] mt-1 font-sans">
            Inspect autonomous workflow execution graphs, step dependencies, and agent outputs.
          </p>
        </div>
      </div>

      {/* Task Selector */}
      <div className="flex flex-wrap gap-2">
        {tasks.map((t) => (
          <button
            key={t.id}
            onClick={() => selectTask(t.id)}
            className={`px-3 py-2 rounded border font-mono text-xs cursor-pointer transition-all ${
              activeTask?.id === t.id
                ? 'bg-[#111111] text-white border-[#111111] font-bold'
                : 'bg-white text-[#666666] border-[#E5E5E5] hover:border-[#111111]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${t.status === 'COMPLETED' ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'}`} />
              <span>{t.title}</span>
              <span className="text-[10px] text-[#8A8A8A]">({t.status})</span>
            </div>
          </button>
        ))}
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Workflow Inspector Timeline */}
        <div className="lg:col-span-5">
          <WorkflowInspector />
        </div>

        {/* Right Column - Node Inspector Panel */}
        <div className="lg:col-span-7 bg-white border border-[#E5E5E5] rounded p-6 shadow-2xs space-y-6 self-start">
          {selectedNode ? (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex items-start justify-between border-b border-[#E5E5E5] pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] text-[#111111] font-mono text-[10px] uppercase font-bold">
                      ROLE: {selectedNode.role.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[#8A8A8A]">
                      AGENT: {selectedNode.agentId}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#111111] mt-1.5 uppercase tracking-tight">
                    {selectedNode.label}
                  </h3>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase ${
                    selectedNode.status === 'completed'
                      ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                      : selectedNode.status === 'running'
                      ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30'
                      : selectedNode.status === 'awaiting_approval'
                      ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                      : 'bg-[#F7F7F5] text-[#8A8A8A] border-[#E5E5E5]'
                  }`}>
                    {selectedNode.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {selectedNode.toolName && (
                <div className="bg-[#F7F7F5] p-3 rounded border border-[#E5E5E5] space-y-1">
                  <span className="text-[10px] text-[#8A8A8A] font-bold uppercase block">TOOL INVOCATION GATEWAY</span>
                  <span className="text-[#111111] font-bold text-xs font-mono">{selectedNode.toolName}</span>
                </div>
              )}

              {selectedNode.details && (
                <div>
                  <span className="text-[10px] text-[#8A8A8A] font-bold uppercase block mb-1.5">EXECUTION DETAILS</span>
                  <div className="p-4 bg-[#F7F7F5] border border-[#E5E5E5] rounded text-[#111111] font-sans text-xs leading-relaxed">
                    {selectedNode.details}
                  </div>
                </div>
              )}

              {selectedNode.outputSummary && (
                <div>
                  <span className="text-[10px] text-[#8A8A8A] font-bold uppercase block mb-1.5">STRUCTURED REASONING OUTPUT</span>
                  <div className="p-4 bg-[#111111] text-[#A3A3A3] border border-[#222222] rounded text-xs leading-relaxed whitespace-pre-wrap max-h-[280px] overflow-y-auto font-mono">
                    {selectedNode.outputSummary}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center font-mono text-[#8A8A8A]">
              <span>SELECT A WORKFLOW NODE TO INSPECT DETAILS</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

