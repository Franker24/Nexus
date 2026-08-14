/**
 * NEXUS - Approval Service
 * Manages human-in-the-loop approval workflows for sensitive operational tools.
 */

import { memoryContainer } from '../repositories/memoryStore';
import { ApprovalRequest, ApprovalStatus, ToolRiskLevel } from '../types/nexus';
import { eventBus } from './eventBus';

export interface CreateApprovalParams {
  taskId: string;
  traceId: string;
  agentId: string;
  toolId: string;
  toolParams: Record<string, any>;
  actionDescription: string;
  reason: string;
  riskLevel: ToolRiskLevel;
  evidence: string[];
  affectedResource: string;
  policyRule: string;
}

export class ApprovalService {
  async createRequest(params: CreateApprovalParams): Promise<ApprovalRequest> {
    const approval = await memoryContainer.approvals.create({
      ...params,
      status: 'PENDING'
    });

    eventBus.publish({
      taskId: params.taskId,
      traceId: params.traceId,
      eventType: 'approval.requested',
      agentId: params.agentId,
      actor: 'Nexus Security Policy',
      payload: {
        approvalId: approval.id,
        toolId: params.toolId,
        riskLevel: params.riskLevel,
        actionDescription: params.actionDescription,
        reason: params.reason
      }
    });

    return approval;
  }

  async getPending(): Promise<ApprovalRequest[]> {
    return memoryContainer.approvals.getPending();
  }

  async getById(id: string): Promise<ApprovalRequest | null> {
    return memoryContainer.approvals.getById(id);
  }

  async getByTaskId(taskId: string): Promise<ApprovalRequest[]> {
    return memoryContainer.approvals.getByTaskId(taskId);
  }

  async getAll(): Promise<ApprovalRequest[]> {
    return memoryContainer.approvals.getAll();
  }

  async approveRequest(
    id: string,
    decidedBy = 'Human Operator'
  ): Promise<{ approval: ApprovalRequest; taskId: string }> {
    const existing = await memoryContainer.approvals.getById(id);
    if (!existing) {
      throw new Error(`Approval request '${id}' not found`);
    }

    if (existing.status !== 'PENDING') {
      throw new Error(`Approval request '${id}' is already ${existing.status}`);
    }

    const updated = await memoryContainer.approvals.updateStatus(id, 'APPROVED', decidedBy);
    if (!updated) {
      throw new Error(`Failed to update approval status for '${id}'`);
    }

    eventBus.publish({
      taskId: existing.taskId,
      traceId: existing.traceId,
      eventType: 'approval.approved',
      actor: decidedBy,
      payload: {
        approvalId: existing.id,
        toolId: existing.toolId,
        decidedBy
      }
    });

    return { approval: updated, taskId: existing.taskId };
  }

  async rejectRequest(
    id: string,
    reason = 'Action denied by Human Operator',
    decidedBy = 'Human Operator'
  ): Promise<{ approval: ApprovalRequest; taskId: string }> {
    const existing = await memoryContainer.approvals.getById(id);
    if (!existing) {
      throw new Error(`Approval request '${id}' not found`);
    }

    if (existing.status !== 'PENDING') {
      throw new Error(`Approval request '${id}' is already ${existing.status}`);
    }

    const updated = await memoryContainer.approvals.updateStatus(
      id,
      'REJECTED',
      decidedBy,
      reason
    );
    if (!updated) {
      throw new Error(`Failed to update approval status for '${id}'`);
    }

    eventBus.publish({
      taskId: existing.taskId,
      traceId: existing.traceId,
      eventType: 'approval.rejected',
      actor: decidedBy,
      payload: {
        approvalId: existing.id,
        toolId: existing.toolId,
        reason,
        decidedBy
      }
    });

    return { approval: updated, taskId: existing.taskId };
  }
}

export const approvalService = new ApprovalService();
