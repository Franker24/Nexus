/**
 * NEXUS - Agent Fleet Visualizer Grid
 */

import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { AgentFleetCard } from './AgentFleetCard';

export const AgentFleetGrid: React.FC = () => {
  const { agents, activeWorkflow, setActiveRoute } = useNexus();

  // Find active node in current workflow if running
  const activeNode = activeWorkflow?.nodes.find(
    (n) => n.status === 'running' || n.status === 'awaiting_approval'
  );

  return (
    <div className="bg-white border border-[#E5E5E5] rounded p-6 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4 mb-5">
        <div>
          <h3 className="text-xs font-mono font-bold text-[#111111] tracking-wider uppercase">
            AUTONOMOUS AGENT FLEET REGISTRY
          </h3>
          <p className="text-xs text-[#666666] font-sans mt-0.5">
            Real-time status and assigned workloads across localized agency personas.
          </p>
        </div>

        <button
          onClick={() => setActiveRoute('agents')}
          className="text-xs text-[#111111] hover:text-[#000000] font-mono underline cursor-pointer font-bold"
        >
          VIEW FULL FLEET →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const isCurrentAgent = activeNode?.agentId === agent.id;
          const stepDesc = isCurrentAgent ? activeNode?.details : undefined;

          return (
            <AgentFleetCard
              key={agent.id}
              agent={agent}
              isCurrentAgent={isCurrentAgent}
              currentStepDescription={stepDesc}
              onClick={() => setActiveRoute('agents')}
            />
          );
        })}
      </div>
    </div>
  );
};

