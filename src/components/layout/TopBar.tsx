/**
 * NEXUS - Top Command Bar
 * Displays brand identity, operational system status, dynamic trace ID, and enterprise actions.
 */

import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { Play, RotateCcw } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    agents,
    activeTask,
    activeRoute,
    health,
    isTriggering,
    isResetting,
    triggerScenario,
    resetScenario,
    openTraceExplorer
  } = useNexus();

  const isOperational = health?.status === 'healthy';

  const routeTitles: Record<string, string> = {
    mission: 'Mission Control',
    agents: 'Agents Fleet',
    workflows: 'Workflows',
    approvals: 'Approvals',
    memory: 'Memory Store',
    audit: 'Audit Trail'
  };

  const activeTitle = routeTitles[activeRoute] || 'Mission Control';

  return (
    <header id="top-bar" className="h-14 bg-white border-b border-[#E5E5E5] px-6 flex items-center justify-between text-xs font-sans shrink-0 select-none z-20">
      {/* Brand & Section Heading */}
      <div className="flex items-center space-x-3">
        <span className="font-mono font-bold text-sm tracking-wider text-[#111111]">NEXUS</span>
        <span className="text-[#8A8A8A] font-light">/</span>
        <span className="font-medium text-[#111111] text-xs">{activeTitle}</span>
      </div>

      {/* Middle Operational Metadata */}
      <div className="hidden lg:flex items-center space-x-6 font-mono text-xs text-[#666666]">
        <div className="flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${isOperational ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'}`} />
          <span className="font-semibold text-[#111111]">
            {isOperational ? 'OPERATIONAL' : 'DEGRADED'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="text-[#8A8A8A]">AGENTS:</span>
          <span className="font-semibold text-[#111111]">{agents.length || 6}</span>
        </div>

        {activeTask && (
          <button
            onClick={() => openTraceExplorer(activeTask.traceId)}
            className="flex items-center space-x-1.5 bg-[#F7F7F5] hover:bg-[#E5E5E5] border border-[#E5E5E5] px-2.5 py-1 rounded text-[11px] cursor-pointer transition-colors"
            title="Click to view in Audit Trace Explorer"
          >
            <span className="text-[#8A8A8A]">TRACE:</span>
            <span className="font-mono font-bold text-[#111111] truncate max-w-[120px]">
              {activeTask.traceId.slice(0, 10)}...
            </span>
          </button>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center space-x-2.5">
        <button
          id="btn-reset-demo"
          onClick={resetScenario}
          disabled={isResetting || isTriggering}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-[#F7F7F5] text-[#111111] rounded border border-[#E5E5E5] transition-colors text-xs font-medium cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-[#666666] ${isResetting ? 'animate-spin' : ''}`} />
          <span>RESET DEMO</span>
        </button>

        <button
          id="btn-trigger-incident"
          onClick={triggerScenario}
          disabled={isTriggering || isResetting}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#111111] hover:bg-[#242424] text-white rounded transition-colors text-xs font-medium cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3 h-3 fill-current text-white" />
          <span>{isTriggering ? 'INITIALIZING...' : 'TRIGGER INCIDENT'}</span>
        </button>
      </div>
    </header>
  );
};

