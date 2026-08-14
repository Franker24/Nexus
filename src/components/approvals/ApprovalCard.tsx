import React, { useState, useEffect } from 'react';
import { ApprovalRequest } from '../../types/nexus';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';

interface ApprovalCardProps {
  approval: ApprovalRequest;
  onApprove: (id: string, decidedBy: string) => Promise<void>;
  onReject: (id: string, reason: string, decidedBy: string) => Promise<void>;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  approval,
  onApprove,
  onReject
}) => {
  const [decidedBy, setDecidedBy] = useState('Security Operator');
  const [rejectReason, setRejectReason] = useState('Action unverified');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<'idle' | 'authorizing' | 'authorized' | 'executing'>('idle');

  const handleApproveClick = async () => {
    setIsSubmitting(true);
    
    // Play visual staging checklist transitions
    setStage('authorizing');
    await new Promise((r) => setTimeout(r, 600));
    setStage('authorized');
    await new Promise((r) => setTimeout(r, 600));
    setStage('executing');
    await new Promise((r) => setTimeout(r, 400));
    
    try {
      await onApprove(approval.id, decidedBy);
    } catch (e) {
      setStage('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = async () => {
    setIsSubmitting(true);
    await onReject(approval.id, rejectReason, decidedBy);
    setIsSubmitting(false);
  };

  const isPending = approval.status === 'PENDING';

  return (
    <div className="bg-white border-y border-r border-l-4 border-l-[#F59E0B] border-[#E5E5E5] rounded p-6 shadow-2xs font-mono text-xs relative overflow-hidden">
      {/* Grid background effect on high risk alert */}
      {isPending && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-grid-scan opacity-50 pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4 mb-5">
        <div className="flex items-center space-x-2.5">
          <ShieldAlert className="w-4 h-4 text-[#F59E0B] animate-quiet-pulse shrink-0" />
          <span className="font-bold text-[#111111] uppercase tracking-wider text-sm">
            GOVERNED SYSTEM GATEWAY — SAFETY CHECK
          </span>
        </div>

        <span className="px-2 py-0.5 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-bold uppercase animate-pulse">
          HIGH RISK ACTION BLOCK
        </span>
      </div>

      {/* Details Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-[#F7F7F5] border border-[#E5E5E5] rounded">
            <span className="text-[10px] text-[#8A8A8A] uppercase font-bold block">TARGET OPERATIONAL TOOL</span>
            <span className="text-[#111111] font-mono font-bold text-sm block mt-1">
              {approval.toolId}
            </span>
          </div>

          <div className="p-3 bg-[#F7F7F5] border border-[#E5E5E5] rounded">
            <span className="text-[10px] text-[#8A8A8A] uppercase font-bold block">GLOBAL TARGET TASK ID</span>
            <span className="text-[#111111] font-mono text-xs block mt-1.5 select-all">
              {approval.taskId}
            </span>
          </div>
        </div>

        {/* Policy Details */}
        <div className="border border-[#E5E5E5] rounded overflow-hidden">
          <div className="bg-[#F7F7F5] px-3 py-2 border-b border-[#E5E5E5] flex items-center justify-between">
            <span className="font-bold text-[#111111]">POLICY ENFORCEMENT</span>
            <span className="text-[10px] bg-white border border-[#E5E5E5] px-1.5 py-0.5 rounded text-[#111111] font-bold">
              {approval.policyRule}
            </span>
          </div>
          <div className="p-3 bg-white flex items-center justify-between text-[11px]">
            <span className="text-[#666666] font-sans">
              Rule condition flagged this invocation. Action requires explicit cryptographic authorization.
            </span>
            <span className="text-[#F59E0B] font-bold uppercase shrink-0 ml-2">
              BLOCKED (MANDATORY APPROVAL)
            </span>
          </div>
        </div>

        {/* Evidence Card */}
        <div className="bg-[#F7F7F5] p-4 rounded border border-[#E5E5E5] space-y-2.5">
          <div>
            <span className="text-[10px] text-[#8A8A8A] uppercase font-bold block">REASONING & EVIDENCE</span>
            <p className="text-[#111111] font-sans mt-1 leading-relaxed text-xs">
              {approval.reason}
            </p>
          </div>
          {approval.evidence && approval.evidence.length > 0 && (
            <div className="pt-2 border-t border-[#E5E5E5]">
              <span className="text-[9px] text-[#8A8A8A] uppercase font-bold block mb-1">METRIC SIGNATURES</span>
              <ul className="space-y-1.5 pl-3 text-[11px] text-[#666666] font-mono">
                {approval.evidence.map((item, idx) => (
                  <li key={idx} className="list-none flex items-start space-x-1">
                    <span className="text-[#F59E0B] shrink-0 font-bold">»</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls */}
      {isPending ? (
        <div className="mt-6 pt-5 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-[#8A8A8A] font-bold">OPERATOR IDENTITY:</span>
            <input
              type="text"
              value={decidedBy}
              onChange={(e) => setDecidedBy(e.target.value)}
              className="px-2.5 py-1 bg-[#F7F7F5] border border-[#E5E5E5] hover:border-[#111111] rounded text-xs text-[#111111] font-mono outline-none focus:border-[#111111] focus:bg-white w-44 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-3">
            {!showRejectForm ? (
              <>
                <button
                  id={`btn-reject-${approval.id}`}
                  onClick={() => setShowRejectForm(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-white hover:bg-[#F7F7F5] text-[#111111] rounded border border-[#E5E5E5] hover:border-[#111111] text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
                >
                  REJECT
                </button>

                <button
                  id={`btn-approve-${approval.id}`}
                  onClick={handleApproveClick}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#111111] hover:bg-[#242424] text-white rounded text-xs font-bold cursor-pointer transition-all duration-150 disabled:opacity-80 disabled:cursor-not-allowed min-w-[160px] flex items-center justify-center space-x-2 shadow-xs"
                >
                  {stage === 'idle' && <span>APPROVE ACTION</span>}
                  {stage === 'authorizing' && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>AUTHORIZING...</span>
                    </>
                  )}
                  {stage === 'authorized' && (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>AUTHORIZED</span>
                    </>
                  )}
                  {stage === 'executing' && (
                    <>
                      <span className="w-1.5 h-1.5 rounded bg-[#3B82F6] animate-spin" />
                      <span>EXECUTING...</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="px-2.5 py-1 bg-[#F7F7F5] border border-[#E5E5E5] rounded text-xs text-[#111111] font-mono outline-none w-48"
                />
                <button
                  onClick={handleRejectClick}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-[#EF4444] text-white rounded text-xs font-bold cursor-pointer"
                >
                  CONFIRM REJECT
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-2 py-1.5 text-[#666666] hover:text-[#111111] text-xs cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-5 pt-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-mono">
          <span className="text-[#8A8A8A] font-bold">
            DECIDED BY: <strong className="text-[#111111]">{approval.decidedBy}</strong>
          </span>
          <span className={`px-2.5 py-0.5 rounded border font-bold uppercase flex items-center space-x-1.5 ${
            approval.status === 'APPROVED'
              ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
              : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
          }`}>
            {approval.status === 'APPROVED' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>APPROVED & EXECUTED</span>
              </>
            ) : (
              <>
                <X className="w-3.5 h-3.5 text-[#EF4444]" />
                <span>{approval.status}</span>
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

