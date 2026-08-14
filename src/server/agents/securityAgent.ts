/**
 * NEXUS - Governance & Security Agent
 * Evaluates security policy rules, tool risk levels, and human approval constraints.
 */

import { BaseAgent, AgentExecutionContext } from './baseAgent';
import { policyEngine } from '../policyEngine';
import { memoryContainer } from '../../repositories/memoryStore';
import { PolicyDecision, ToolRiskLevel } from '../../types/nexus';
import { eventBus } from '../eventBus';

export interface SecurityOutput {
  decision: PolicyDecision;
  policyId?: string;
  targetToolId: string;
  riskLevel: ToolRiskLevel;
  reason: string;
  requiresHumanApproval: boolean;
  affectedResource: string;
  policyRule: string;
}

export class SecurityAgent extends BaseAgent {
  constructor() {
    super('security-agent', 'security');
  }

  async execute(context: AgentExecutionContext): Promise<SecurityOutput> {
    const agentData = await this.getAgentData();
    await this.updateAgentStatus('busy', context.taskId);

    eventBus.publish({
      taskId: context.taskId,
      traceId: context.traceId,
      eventType: 'agent.started',
      agentId: this.id,
      actor: agentData.name,
      payload: { role: this.role }
    });

    let targetToolId = context.sharedContext?.diagnostic?.targetToolId || 'restart_revenue_pipeline';
    let tool = await memoryContainer.tools.getById(targetToolId);

    if (!tool) {
      targetToolId = 'restart_revenue_pipeline';
      tool = (await memoryContainer.tools.getById(targetToolId))!;
    }

    const opsAgent = (await memoryContainer.agents.getById('operations-agent')) || agentData;

    const evalResult = await policyEngine.evaluate(
      opsAgent,
      tool,
      { pipelineId: 'rev-pipe-prod-01' },
      context.taskId,
      context.traceId
    );

    const output: SecurityOutput = {
      decision: evalResult.decision,
      policyId: evalResult.policyId || 'pol-01',
      targetToolId: tool.id,
      riskLevel: tool.riskLevel,
      reason: evalResult.reason,
      requiresHumanApproval: evalResult.requiresHumanApproval,
      affectedResource: 'Revenue Processing Pipeline (Production rev-pipe-prod-01)',
      policyRule: 'pol-01: Financial Infrastructure Restart Policy'
    };

    this.emitFinding(
      context,
      `Security evaluation complete: Decision = ${output.decision}. Action '${tool.name}' has risk level '${tool.riskLevel}' and requires explicit human approval before execution.`,
      { security: output }
    );

    await this.updateAgentStatus('idle');
    return output;
  }
}

export const securityAgent = new SecurityAgent();
