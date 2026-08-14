/**
 * NEXUS - Guided Visual Story Pipeline Component
 * Renders the 8-phase autonomous incident lifecycle.
 * DETECTION → INVESTIGATION → CONTEXT → GOVERNANCE → HUMAN APPROVAL → REMEDIATION → VERIFICATION → RESOLUTION
 */

import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { Check, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const GuidedStoryPipeline: React.FC = () => {
  const { activeTask } = useNexus();

  const steps = [
    { id: 1, key: 'DETECTION', label: 'DETECTION', desc: 'Incident Ingestion' },
    { id: 2, key: 'INVESTIGATION', label: 'INVESTIGATION', desc: 'Diagnostic Analysis' },
    { id: 3, key: 'CONTEXT', label: 'CONTEXT', desc: 'Historical Memory' },
    { id: 4, key: 'GOVERNANCE', label: 'GOVERNANCE', desc: 'Policy Evaluation' },
    { id: 5, key: 'APPROVAL', label: 'HUMAN APPROVAL', desc: 'Security Gateway' },
    { id: 6, key: 'REMEDIATION', label: 'REMEDIATION', desc: 'Authorized Action' },
    { id: 7, key: 'VERIFICATION', label: 'VERIFICATION', desc: 'Health Validation' },
    { id: 8, key: 'RESOLUTION', label: 'RESOLUTION', desc: 'Audit Report' }
  ];

  // Determine current active step index (1-8)
  let currentStep = 0;
  let isAwaiting = false;
  let isCompleted = false;
  let isFailed = false;

  if (activeTask) {
    if (activeTask.status === 'COMPLETED') {
      currentStep = 8;
      isCompleted = true;
    } else if (activeTask.status === 'AWAITING_APPROVAL') {
      currentStep = 5;
      isAwaiting = true;
    } else if (activeTask.status === 'FAILED' || activeTask.status === 'CANCELLED') {
      currentStep = activeTask.currentStepIndex || 5;
      isFailed = true;
    } else if (activeTask.status === 'RUNNING' || activeTask.status === 'QUEUED' || activeTask.status === 'CREATED') {
      currentStep = Math.max(1, Math.min(8, activeTask.currentStepIndex || 1));
    }
  }

  return (
    <div className="bg-white border border-[#E5E5E5] rounded p-4 shadow-2xs font-mono text-xs">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5 mb-3 select-none">
        <span className="text-[10px] font-bold text-[#111111] uppercase tracking-wider flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-quiet-pulse" />
          <span>AUTONOMOUS INCIDENT LIFECYCLE PIPELINE</span>
        </span>
        <span className="text-[10px] text-[#8A8A8A] font-mono">
          {activeTask ? `TASK ID: ${activeTask.id}` : 'SYSTEM NOMINAL'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {steps.map((step, idx) => {
          const isPast = isCompleted || step.id < currentStep;
          const isActive = step.id === currentStep && !isCompleted;
          const isNext = step.id > currentStep;

          let statusBg = 'bg-[#F7F7F5] border-[#E5E5E5] text-[#8A8A8A]';

          if (isPast) {
            statusBg = 'bg-white border-[#22C55E]/40 text-[#111111] hover:border-[#22C55E]/60';
          } else if (isActive) {
            if (isAwaiting) {
              statusBg = 'bg-[#F59E0B]/5 border-[#F59E0B] text-[#111111] ring-1 ring-[#F59E0B] animate-pulse';
            } else if (isFailed) {
              statusBg = 'bg-[#EF4444]/5 border-[#EF4444] text-[#111111] ring-1 ring-[#EF4444]';
            } else {
              statusBg = 'bg-[#111111] border-[#111111] text-white shadow-xs';
            }
          } else {
            statusBg = 'bg-[#F7F7F5]/50 border-[#E5E5E5] text-[#8A8A8A] opacity-60';
          }

          return (
            <motion.div
              key={step.key}
              whileHover={{ y: -1 }}
              transition={{ duration: 0.12 }}
              className={`p-2.5 rounded border flex flex-col justify-between min-h-[64px] cursor-default select-none transition-all duration-150 ${statusBg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8A8A]">
                  {step.label}
                </span>

                {isPast ? (
                  <Check className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                ) : isActive ? (
                  isAwaiting ? (
                    <Clock className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                  ) : isFailed ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                  )
                ) : (
                  <span className="text-[9px] text-[#8A8A8A] font-bold">{step.id}</span>
                )}
              </div>

              <div className={`text-[10px] font-semibold mt-1.5 truncate ${
                isActive && !isAwaiting && !isFailed ? 'text-white' : 'text-[#111111]'
              }`}>
                {step.desc}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
