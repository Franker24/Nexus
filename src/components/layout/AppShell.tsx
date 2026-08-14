/**
 * NEXUS - Persistent Application Shell
 * Assembles TopBar, Sidebar, and View Router with enterprise monochrome canvas.
 */

import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { MissionControl } from '../mission/MissionControl';
import { AgentFleetView } from '../agents/AgentFleetView';
import { WorkflowInspectorView } from '../workflow/WorkflowInspectorView';
import { ApprovalCenter } from '../approvals/ApprovalCenter';
import { MemoryInspectorView } from '../memory/MemoryInspectorView';
import { AuditTrailView } from '../audit/AuditTrailView';
import { AlertCircle, RefreshCw, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const AppShell: React.FC = () => {
  const {
    activeRoute,
    error,
    isLoading,
    isSseConnected,
    demoNotification,
    refreshAllData,
    reconnectSse,
    dismissNotification,
    openTraceExplorer
  } = useNexus();

  const renderActiveView = () => {
    switch (activeRoute) {
      case 'mission':
        return <MissionControl />;
      case 'agents':
        return <AgentFleetView />;
      case 'workflows':
        return <WorkflowInspectorView />;
      case 'approvals':
        return (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            <ApprovalCenter />
          </div>
        );
      case 'memory':
        return <MemoryInspectorView />;
      case 'audit':
        return <AuditTrailView />;
      default:
        return <MissionControl />;
    }
  };

  return (
    <div className="h-screen w-screen bg-[#F7F7F5] text-[#111111] flex flex-col overflow-hidden font-sans antialiased select-none">
      {/* Top Command Bar */}
      <TopBar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic View Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F7F7F5] relative">
          {/* Compact Incident Trigger Notification Banner */}
          {demoNotification && (
            <div className="mx-6 mt-4 p-4 bg-white border-2 border-[#111111] rounded shadow-md flex items-center justify-between font-mono text-xs animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping shrink-0" />
                <div>
                  <span className="font-bold text-[#111111] uppercase tracking-wider block">
                    {demoNotification.title}
                  </span>
                  <span className="text-[#666666] font-sans block mt-0.5">
                    {demoNotification.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => openTraceExplorer(demoNotification.traceId)}
                  className="px-3 py-1 bg-[#F7F7F5] hover:bg-[#E5E5E5] border border-[#E5E5E5] rounded text-[#111111] font-bold text-[11px] cursor-pointer transition-colors flex items-center space-x-1"
                >
                  <span>TRACE: {demoNotification.traceId.slice(0, 8)}...</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={dismissNotification}
                  className="p-1 hover:bg-[#F7F7F5] rounded text-[#8A8A8A] hover:text-[#111111] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SSE Disconnection Banner */}
          {!isSseConnected && (
            <div className="mx-6 mt-4 p-3 bg-white border border-[#F59E0B] rounded flex items-center justify-between text-xs font-mono text-[#111111]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                <span>LIVE EVENT STREAM INTERRUPTED — Attempting reconnection...</span>
              </div>
              <button
                onClick={reconnectSse}
                className="px-2.5 py-1 bg-[#F7F7F5] hover:bg-[#E5E5E5] border border-[#E5E5E5] rounded font-bold cursor-pointer transition-colors text-[11px]"
              >
                RECONNECT
              </button>
            </div>
          )}

          {error && (
            <div className="m-6 p-4 bg-white border border-[#EF4444] rounded flex items-center justify-between text-xs font-mono text-[#111111] shadow-sm">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
                <div>
                  <strong className="block font-bold text-[#EF4444]">NEXUS BACKEND UNAVAILABLE</strong>
                  <span className="text-[#666666]">{error}</span>
                </div>
              </div>
              <button
                onClick={refreshAllData}
                className="px-3 py-1.5 bg-[#111111] hover:bg-[#242424] text-white rounded font-bold cursor-pointer transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RECONNECT</span>
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center font-mono text-xs text-[#666666] space-y-3">
              <RefreshCw className="w-5 h-5 text-[#111111] animate-spin" />
              <span>SYNCING WITH NEXUS BACKEND STATE...</span>
            </div>
          ) : (
            <motion.div
              key={activeRoute}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full w-full"
            >
              {renderActiveView()}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

