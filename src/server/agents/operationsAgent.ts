/**
 * NEXUS - System Operations Agent
 * Executes authorized tool remediation through Tool Gateway once approval is granted.
 */

import { BaseAgent, AgentExecutionContext } from './baseAgent';
import { toolGateway, ToolExecutionResult } from '../toolGateway';
import { eventBus } from '../eventBus';

export class OperationsAgent extends BaseAgent {
  constructor() {
    super('operations-agent', 'operations');
  }

  async execute(context: AgentExecutionContext): Promise<ToolExecutionResult> {
    const agentData = await this.getAgentData();
    await this.updateAgentStatus('busy', context.taskId);

    eventBus.publish({
      taskId: context.taskId,
      traceId: context.traceId,
      eventType: 'agent.started',
      agentId: this.id,
      actor: agentData.name,
      payload: { role: this.role, approvalId: context.approvalId }
    });

    const targetToolId = context.sharedContext?.security?.targetToolId || 'restart_revenue_pipeline';

    const result = await toolGateway.executeTool({
      agent: agentData,
      toolId: targetToolId,
      params: { pipelineId: 'rev-pipe-prod-01', forceResetLocks: true },
      taskId: context.taskId,
      traceId: context.traceId,
      approvalId: context.approvalId
    });

    if (result.success) {
      this.emitFinding(
        context,
        `Tool execution SUCCESS: ${result.toolName} executed successfully. Infrastructure worker state reset and locks flushed.`,
        { toolResult: result }
      );
    } else {
      this.emitFinding(
        context,
        `Tool execution FAILED: ${result.error}`,
        { toolResult: result }
      );
    }

    await this.updateAgentStatus('idle');
    return result;
  }
}

export const operationsAgent = new OperationsAgent();
