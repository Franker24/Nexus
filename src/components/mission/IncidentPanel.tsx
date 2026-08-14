import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { Play, ShieldCheck, CheckCircle2, Activity, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const IncidentPanel: React.FC = () => {
  const { activeTask, isTriggering, triggerScenario, openTraceExplorer } = useNexus();

  // If no active task, render clean SYSTEM NOMINAL banner
  if (!activeTask) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded p-6 shadow-2xs font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full bg-[#22C55E] animate-quiet-pulse" />
            <div>
              <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
                SYSTEM NOMINAL — ALL PIPELINES OPERATIONAL
              </h2>
              <p className="text-[#666666] font-sans mt-0.5 text-xs">
                No active operational incidents detected. NEXUS autonomous agents standing by.
              </p>
            </div>
          </div>

          <button
            id="btn-trigger-panel"
            onClick={triggerScenario}
            disabled={isTriggering}
            className="px-4 py-2 bg-[#111111] hover:bg-[#242424] text-white rounded font-bold cursor-pointer transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current text-white" />
            <span>{isTriggering ? 'INITIALIZING DEMO...' : 'TRIGGER DEMO INCIDENT'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Determine dynamic Incident Status from workflow state
  let incidentStatus = 'DEGRADED';
  let dotColor = 'bg-[#F59E0B]';

  switch (activeTask.status) {
    case 'CREATED':
    case 'QUEUED':
      incidentStatus = 'DEGRADED';
      dotColor = 'bg-[#F59E0B]';
      break;
    case 'RUNNING':
      if (activeTask.currentStepIndex <= 3) {
        incidentStatus = 'INVESTIGATING';
        dotColor = 'bg-[#3B82F6]';
      } else if (activeTask.currentStepIndex === 6) {
        incidentStatus = 'REMEDIATING';
        dotColor = 'bg-[#3B82F6]';
      } else if (activeTask.currentStepIndex === 7) {
        incidentStatus = 'VERIFYING RECOVERY';
        dotColor = 'bg-[#3B82F6]';
      } else {
        incidentStatus = 'INVESTIGATING';
        dotColor = 'bg-[#3B82F6]';
      }
      break;
    case 'AWAITING_APPROVAL':
      incidentStatus = 'AWAITING AUTHORIZATION';
      dotColor = 'bg-[#F59E0B]';
      break;
    case 'COMPLETED':
      incidentStatus = 'RESOLVED';
      dotColor = 'bg-[#22C55E]';
      break;
    case 'FAILED':
    case 'CANCELLED':
      incidentStatus = 'REMEDIATION BLOCKED';
      dotColor = 'bg-[#EF4444]';
      break;
  }

  // Determine dynamic telemetry based on incident recovery status
  const isRecovered = activeTask.status === 'COMPLETED';
  const isVerifying = activeTask.status === 'RUNNING' && activeTask.currentStepIndex === 7;
  const isRemediating = activeTask.status === 'RUNNING' && activeTask.currentStepIndex === 6;

  const telemetry = {
    queueDepth: isRecovered ? '0 (Draining)' : isVerifying ? '210' : isRemediating ? '4,120' : '18,420',
    processingRate: isRecovered ? '4,650/min' : isVerifying ? '4,500/min' : isRemediating ? '2,800/min' : '0/min',
    errorRate: isRecovered ? '0.1%' : isVerifying ? '0.2%' : isRemediating ? '4.2%' : '87%',
    workerSaturation: isRecovered ? '14% (normal)' : isVerifying ? '22%' : isRemediating ? '42%' : '96% (saturated)'
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded p-6 shadow-2xs space-y-4">
      {/* Dynamic Action Banner for Remediation / Verification Moment */}
      {isRemediating && (
        <div className="p-3 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded flex items-center justify-between font-mono text-xs text-[#111111] animate-fade-in">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#3B82F6] animate-spin" />
            <span className="font-bold">SYSTEM OPERATIONS:</span>
            <span>Executing authorized remediation — <strong>restart_revenue_pipeline</strong></span>
          </div>
          <span className="text-[10px] uppercase font-bold text-[#3B82F6]">IN PROGRESS</span>
        </div>
      )}

      {isVerifying && (
        <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded flex items-center justify-between font-mono text-xs text-[#111111] animate-fade-in">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#F59E0B] animate-pulse" />
            <span className="font-bold">VERIFYING RECOVERY:</span>
            <span>NEXUS is independently validating system health & telemetry stability...</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-[#F59E0B]">VALIDATING</span>
        </div>
      )}

      {isRecovered && (
        <div className="p-3 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded flex items-center justify-between font-mono text-xs text-[#111111] animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span className="font-bold text-[#22C55E]">VERIFICATION COMPLETE:</span>
            <span>Pipeline healthy (4,650 tx/min, 0.1% error rate, 0 queue locks)</span>
          </div>
          <button
            onClick={() => openTraceExplorer(activeTask.traceId)}
            className="px-2.5 py-1 bg-white border border-[#E5E5E5] rounded text-[10px] font-bold text-[#111111] hover:bg-[#F7F7F5] cursor-pointer flex items-center space-x-1"
          >
            <span>AUDIT TRACE</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E5E5] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-[#EF4444] uppercase tracking-wider">
            <span>CRITICAL INCIDENT</span>
            <span className="text-[#8A8A8A]">•</span>
            <span className="text-[#666666]">Revenue Operations</span>
            <span className="text-[#8A8A8A]">•</span>
            <button
              onClick={() => openTraceExplorer(activeTask.traceId)}
              className="text-[#111111] underline hover:text-[#3B82F6] cursor-pointer font-bold"
            >
              TRACE: {activeTask.traceId.slice(0, 10)}...
            </button>
          </div>

          <h2 className="text-xl font-bold text-[#111111] mt-1 tracking-tight">
            {activeTask.title}
          </h2>

          <p className="text-xs text-[#666666] mt-1 leading-relaxed max-w-4xl font-sans">
            {activeTask.objective}
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2 bg-[#F7F7F5] border border-[#E5E5E5] px-3 py-1.5 rounded">
          <span className={`w-2 h-2 rounded-full animate-quiet-pulse ${dotColor}`} />
          <span className="font-mono text-xs font-semibold text-[#111111] uppercase tracking-wide">
            {incidentStatus}
          </span>
        </div>
      </div>

      {/* Metrics Clean Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <motion.div
          whileHover={{ y: -1 }}
          className="bg-[#F7F7F5]/50 border border-[#E5E5E5] p-4 rounded hover:border-[#111111] transition-all duration-150"
        >
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>QUEUE DEPTH</span>
            {!isRecovered && <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />}
          </div>
          <div className="text-lg font-bold text-[#111111] mt-1.5">
            {telemetry.queueDepth}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -1 }}
          className="bg-[#F7F7F5]/50 border border-[#E5E5E5] p-4 rounded hover:border-[#111111] transition-all duration-150"
        >
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>PROCESSING RATE</span>
            {isRemediating || isVerifying ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-ping" />
            ) : isRecovered ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A8A8A]" />
            )}
          </div>
          <div className="text-lg font-bold text-[#111111] mt-1.5">
            {telemetry.processingRate}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -1 }}
          className="bg-[#F7F7F5]/50 border border-[#E5E5E5] p-4 rounded hover:border-[#111111] transition-all duration-150"
        >
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>ERROR RATE</span>
            {!isRecovered ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            )}
          </div>
          <div className={`text-lg font-bold mt-1.5 ${
            isRecovered ? 'text-[#22C55E]' : 'text-[#EF4444]'
          }`}>
            {telemetry.errorRate}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -1 }}
          className="bg-[#F7F7F5]/50 border border-[#E5E5E5] p-4 rounded hover:border-[#111111] transition-all duration-150"
        >
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>WORKER SATURATION</span>
            {isRecovered ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
            )}
          </div>
          <div className="text-lg font-bold text-[#111111] mt-1.5">
            {telemetry.workerSaturation}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

