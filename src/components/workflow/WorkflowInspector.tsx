import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { WorkflowNodeCard } from './WorkflowNodeCard';
import { WorkflowNode } from '../../types/nexus';

export const WorkflowInspector: React.FC = () => {
  const { activeWorkflow, selectedNodeId, setSelectedNodeId } = useNexus();

  const nodes = activeWorkflow?.nodes || [];

  const handleNodeClick = (node: WorkflowNode) => {
    setSelectedNodeId(node.id);
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded p-6 shadow-2xs relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4 mb-5">
        <div>
          <h3 className="text-xs font-mono font-bold text-[#111111] tracking-wider uppercase flex items-center space-x-1.5 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-quiet-pulse" />
            <span>WORKFLOW EXECUTION TIMELINE</span>
          </h3>
          <p className="text-xs text-[#666666] font-sans mt-0.5">
            Sequential state machine execution across autonomous agent nodes.
          </p>
        </div>

        <div className="text-[10px] font-mono text-[#8A8A8A] uppercase font-bold select-none">
          STRICT GOVERNANCE CONSTRAINTS
        </div>
      </div>

      {/* Execution Timeline Vertical Flow */}
      <div className="space-y-1">
        {nodes.map((node, idx) => (
          <WorkflowNodeCard
            key={node.id}
            node={node}
            stepNumber={idx + 1}
            isSelected={selectedNodeId === node.id}
            isLast={idx === nodes.length - 1}
            onClick={() => handleNodeClick(node)}
          />
        ))}
      </div>
    </div>
  );
};

