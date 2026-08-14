import React from 'react';
import { Agent } from '../../types/nexus';
import { motion } from 'motion/react';

interface AgentFleetCardProps {
  agent: Agent;
  currentStepDescription?: string;
  isCurrentAgent?: boolean;
  onClick?: () => void;
}

export const AgentFleetCard: React.FC<AgentFleetCardProps> = ({
  agent,
  currentStepDescription,
  isCurrentAgent,
  onClick
}) => {
  let statusDotColor = 'bg-[#8A8A8A]';
  let statusText = agent.status.toUpperCase();
  let isPulsing = false;

  if (agent.status === 'busy' || isCurrentAgent) {
    statusDotColor = 'bg-[#3B82F6]';
    statusText = 'BUSY';
    isPulsing = true;
  } else if (agent.status === 'active') {
    statusDotColor = 'bg-[#22C55E]';
    statusText = 'IDLE';
    isPulsing = true;
  } else if (agent.status === 'paused') {
    statusDotColor = 'bg-[#F59E0B]';
    statusText = 'PAUSED';
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.12 }}
      className={`p-3.5 rounded border transition-colors cursor-pointer font-mono text-xs select-none ${
        isCurrentAgent
          ? 'bg-white border-[#111111] shadow-2xs'
          : 'bg-[#FFFFFF]/80 hover:bg-white border-[#E5E5E5]'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-[#111111] uppercase tracking-wide">
          {agent.id}
        </span>
        <div className="flex items-center space-x-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor} ${isPulsing ? 'animate-quiet-pulse' : ''}`} />
          <span className="text-[10px] font-bold text-[#666666] tracking-wider uppercase">
            {statusText}
          </span>
        </div>
      </div>

      <div className="mt-1.5 font-sans text-xs font-semibold text-[#111111]">
        {agent.name}
      </div>

      <div className="text-[11px] font-sans text-[#666666] mt-1 line-clamp-2 leading-relaxed">
        {currentStepDescription || agent.description}
      </div>

      <div className="mt-3.5 pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-[10px] text-[#8A8A8A]">
        <span>ROLE: <strong className="text-[#111111] uppercase">{agent.role}</strong></span>
        <span>MODEL: <code className="text-[#666666] font-mono">{agent.model}</code></span>
      </div>
    </motion.div>
  );
};

