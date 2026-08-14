/**
 * NEXUS - Policy Engine
 * Evaluates security policy rules, tool risk levels, and permissions.
 */

import { memoryContainer } from '../repositories/memoryStore';
import { SecurityPolicy, PolicyDecision, ToolDefinition, Agent } from '../types/nexus';
import { eventBus } from './eventBus';

export interface PolicyEvaluationResult {
  decision: PolicyDecision;
  policyId?: string;
  policyName?: string;
  riskLevel: ToolDefinition['riskLevel'];
  reason: string;
  requiresHumanApproval: boolean;
}

export class PolicyEngine {
  async evaluate(
    agent: Agent,
    tool: ToolDefinition,
    params: Record<string, any>,
    taskId: string,
    traceId: string
  ): Promise<PolicyEvaluationResult> {
    // 1. Permission check
    const missingPermissions = tool.requiredPermissions.filter(
      (perm) => !agent.permissions.includes(perm)
    );

    if (missingPermissions.length > 0) {
      const result: PolicyEvaluationResult = {
        decision: 'DENY',
        riskLevel: tool.riskLevel,
        reason: `Agent '${agent.id}' lacks required permissions: ${missingPermissions.join(', ')}`,
        requiresHumanApproval: false
      };

      eventBus.publish({
        taskId,
        traceId,
        eventType: 'policy.evaluated',
        agentId: agent.id,
        actor: agent.name,
        payload: { toolId: tool.id, decision: result.decision, reason: result.reason }
      });

      return result;
    }

    // 2. Policy rules check
    const policy = await memoryContainer.policies.getByToolId(tool.id);

    if (policy) {
      const requiresApproval = policy.decision === 'REQUIRES_APPROVAL' || tool.requiresApproval;
      const decision: PolicyDecision = requiresApproval ? 'REQUIRES_APPROVAL' : policy.decision;

      const result: PolicyEvaluationResult = {
        decision,
        policyId: policy.id,
        policyName: policy.name,
        riskLevel: tool.riskLevel,
        reason: policy.reason,
        requiresHumanApproval: requiresApproval
      };

      eventBus.publish({
        taskId,
        traceId,
        eventType: 'policy.evaluated',
        agentId: agent.id,
        actor: agent.name,
        payload: { toolId: tool.id, decision: result.decision, policyId: policy.id, reason: result.reason }
      });

      return result;
    }

    // 3. Default tool risk check
    const requiresApproval = tool.requiresApproval || tool.riskLevel === 'high' || tool.riskLevel === 'critical';
    const decision: PolicyDecision = requiresApproval ? 'REQUIRES_APPROVAL' : 'ALLOW';

    const result: PolicyEvaluationResult = {
      decision,
      riskLevel: tool.riskLevel,
      reason: requiresApproval
        ? `Tool '${tool.name}' has risk level '${tool.riskLevel}' and requires explicit approval.`
        : `Tool '${tool.name}' is low risk and auto-authorized.`,
      requiresHumanApproval: requiresApproval
    };

    eventBus.publish({
      taskId,
      traceId,
      eventType: 'policy.evaluated',
      agentId: agent.id,
      actor: agent.name,
      payload: { toolId: tool.id, decision: result.decision, reason: result.reason }
    });

    return result;
  }
}

export const policyEngine = new PolicyEngine();
