import React from 'react';
import { WorkflowNode } from '../../types/nexus';
import { motion } from 'motion/react';
import { Check, Clock, AlertTriangle, Settings } from 'lucide-react';

interface WorkflowNodeCardProps {
  node: WorkflowNode;
  stepNumber: number;
  isSelected?: boolean;
  onClick?: () => void;
  isLast?: boolean;
}

export const WorkflowNodeCard: React.FC<WorkflowNodeCardProps> = ({
  node,
  stepNumber,
  isSelected,
  onClick,
  isLast
}) => {
  let cardBorder = 'border-[#E5E5E5] bg-white';
  let statusDotColor = 'bg-[#8A8A8A]';
  let statusLabel = node.status.toUpperCase();
  let statusTextColor = 'text-[#666666]';
  let statusIcon = null;

  switch (node.status) {
    case 'completed':
      statusDotColor = 'bg-[#22C55E]';
      statusTextColor = 'text-[#22C55E]';
      cardBorder = 'border-[#E5E5E5] bg-white';
      statusIcon = <Check className="w-3 h-3 text-[#22C55E]" />;
      break;
    case 'running':
      statusDotColor = 'bg-[#3B82F6]';
      statusTextColor = 'text-[#3B82F6]';
      cardBorder = 'border-[#111111] bg-white ring-1 ring-[#111111]';
      statusIcon = <Settings className="w-3 h-3 text-[#3B82F6] animate-spin" />;
      break;
    case 'awaiting_approval':
      statusDotColor = 'bg-[#F59E0B]';
      statusTextColor = 'text-[#F59E0B]';
      statusLabel = 'WAITING FOR HUMAN AUTHORIZATION';
      cardBorder = 'border-[#F59E0B] bg-[#F59E0B]/5 ring-1 ring-[#F59E0B]';
      statusIcon = <Clock className="w-3 h-3 text-[#F59E0B] animate-pulse" />;
      break;
    case 'failed':
      statusDotColor = 'bg-[#EF4444]';
      statusTextColor = 'text-[#EF4444]';
      cardBorder = 'border-[#EF4444] bg-[#EF4444]/5';
      statusIcon = <AlertTriangle className="w-3 h-3 text-[#EF4444]" />;
      break;
    default:
      break;
  }

  const stepFormatted = String(stepNumber).padStart(2, '0');

  return (
    <div className="relative font-mono text-xs select-none">
      <motion.div
        onClick={onClick}
        whileHover={{ y: -1 }}
        transition={{ duration: 0.12 }}
        className={`p-3.5 rounded transition-all cursor-pointer border ${cardBorder} ${
          isSelected ? 'shadow-xs border-[#111111]' : 'hover:border-[#8A8A8A]'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-[#111111] bg-[#F7F7F5] px-1.5 py-0.5 rounded border border-[#E5E5E5]">
              {stepFormatted}
            </span>
            <div>
              <span className="font-bold text-[#111111] uppercase tracking-wide">
                {node.role.replace('_', ' ')}: {node.label}
              </span>
              <div className="text-[11px] text-[#666666] font-sans mt-0.5 line-clamp-2">
                {node.details}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {statusIcon}
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusTextColor}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        {node.status === 'awaiting_approval' && (
          <div className="mt-2 pl-8 text-[11px] text-[#F59E0B] font-bold flex items-center space-x-1">
            <span>└──</span>
            <span>POL-01: ACTIONS SUSPENDED PENDING SAFETY CHECK</span>
          </div>
        )}

        {node.toolName && (
          <div className="mt-2 pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-[10px] text-[#8A8A8A]">
            <span>TOOL: <code className="text-[#111111] font-bold font-mono">{node.toolName}</code></span>
            <span>AGENT: <code className="text-[#666666] font-mono">{node.agentId}</code></span>
          </div>
        )}
      </motion.div>

      {!isLast && (
        <div className="flex justify-center py-1">
          <div className={`w-px h-4 ${
            node.status === 'completed'
              ? 'bg-[#22C55E]'
              : node.status === 'running'
              ? 'bg-[#3B82F6]'
              : 'bg-[#E5E5E5]'
          }`} />
        </div>
      )}
    </div>
  );
};

