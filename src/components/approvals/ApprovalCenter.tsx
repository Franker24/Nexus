/**
 * NEXUS - Approval Center Component
 */

import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { ApprovalCard } from './ApprovalCard';

export const ApprovalCenter: React.FC = () => {
  const { activeApprovals, pendingApprovals, approveAction, rejectAction } = useNexus();

  // Combine approvals
  const allApprovals = activeApprovals.length > 0 ? activeApprovals : pendingApprovals;

  if (allApprovals.length === 0) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded p-6 text-center font-mono">
        <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
          NO PENDING APPROVAL REQUESTS
        </h4>
        <p className="text-[11px] text-[#666666] mt-1 font-sans">
          All high-risk autonomous agent operations are compliant or executed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-[#E5E5E5] pb-3">
        <h3 className="text-xs font-mono font-bold text-[#111111] tracking-wider uppercase">
          HUMAN-IN-THE-LOOP GOVERNANCE GATEWAY ({allApprovals.length})
        </h3>
        <p className="text-xs text-[#666666] font-sans mt-0.5">
          High-risk tool invocations pending policy validation and operator authorization.
        </p>
      </div>

      <div className="space-y-4">
        {allApprovals.map((approval) => (
          <ApprovalCard
            key={approval.id}
            approval={approval}
            onApprove={approveAction}
            onReject={rejectAction}
          />
        ))}
      </div>
    </div>
  );
};

