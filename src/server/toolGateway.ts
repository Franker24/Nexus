/**
 * NEXUS - Tool Gateway
 * Centralized, secure entrypoint for all agent tool executions.
 * Enforces input validation, agent permissions, policy checks, and approval checks.
 */

import { memoryContainer } from '../repositories/memoryStore';
import { Agent, ToolDefinition } from '../types/nexus';
import { policyEngine } from './policyEngine';
import { approvalService } from './approvalService';
import { pipelineSimulation } from './simulation';
import { memoryService } from './memoryService';
import { eventBus } from './eventBus';

export interface ToolExecutionRequest {
  agent: Agent;
  toolId: string;
  params: Record<string, any>;
  taskId: string;
  traceId: string;
  approvalId?: string;
}

export interface ToolExecutionResult {
  success: boolean;
  toolId: string;
  toolName: string;
  output: Record<string, any>;
  error?: string;
  executionDurationMs: number;
}

export class ToolGateway {
  async executeTool(req: ToolExecutionRequest): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    // 1. Get tool definition
    const tool = await memoryContainer.tools.getById(req.toolId);
    if (!tool) {
      const errorMsg = `Tool '${req.toolId}' not found in registry`;
      this.emitErrorEvent(req, errorMsg);
      return {
        success: false,
        toolId: req.toolId,
        toolName: req.toolId,
        output: {},
        error: errorMsg,
        executionDurationMs: Date.now() - startTime
      };
    }

    // 2. Policy & permission check
    const policyResult = await policyEngine.evaluate(
      req.agent,
      tool,
      req.params,
      req.taskId,
      req.traceId
    );

    if (policyResult.decision === 'DENY') {
      this.emitErrorEvent(req, policyResult.reason);
      return {
        success: false,
        toolId: tool.id,
        toolName: tool.name,
        output: {},
        error: policyResult.reason,
        executionDurationMs: Date.now() - startTime
      };
    }

    // 3. Approval verification if policy or tool requires human approval
    if (policyResult.requiresHumanApproval) {
      if (!req.approvalId) {
        const errorMsg = `Execution of high-risk tool '${tool.name}' requires human approval, but no approvalId was provided.`;
        this.emitErrorEvent(req, errorMsg);
        return {
          success: false,
          toolId: tool.id,
          toolName: tool.name,
          output: {},
          error: errorMsg,
          executionDurationMs: Date.now() - startTime
        };
      }

      const approval = await approvalService.getById(req.approvalId);
      if (!approval) {
        const errorMsg = `Approval record '${req.approvalId}' not found.`;
        this.emitErrorEvent(req, errorMsg);
        return {
          success: false,
          toolId: tool.id,
          toolName: tool.name,
          output: {},
          error: errorMsg,
          executionDurationMs: Date.now() - startTime
        };
      }

      // Security check: Approval MUST bind to exact taskId, toolId, and status APPROVED
      if (
        approval.taskId !== req.taskId ||
        approval.toolId !== req.toolId ||
        approval.status !== 'APPROVED'
      ) {
        const errorMsg = `Security violation: Approval '${req.approvalId}' status is '${approval.status}' or does not match taskId '${req.taskId}' / toolId '${req.toolId}'.`;
        this.emitErrorEvent(req, errorMsg);
        return {
          success: false,
          toolId: tool.id,
          toolName: tool.name,
          output: {},
          error: errorMsg,
          executionDurationMs: Date.now() - startTime
        };
      }
    }

    // 4. Dispatch to tool handler
    eventBus.publish({
      taskId: req.taskId,
      traceId: req.traceId,
      eventType: 'agent.tool_called',
      agentId: req.agent.id,
      actor: req.agent.name,
      payload: { toolId: tool.id, params: req.params, approvalId: req.approvalId }
    });

    try {
      const output = await this.invokeToolHandler(tool.id, req.params);
      const duration = Date.now() - startTime;

      eventBus.publish({
        taskId: req.taskId,
        traceId: req.traceId,
        eventType: 'action.executed',
        agentId: req.agent.id,
        actor: req.agent.name,
        payload: {
          toolId: tool.id,
          toolName: tool.name,
          params: req.params,
          output,
          durationMs: duration
        }
      });

      return {
        success: true,
        toolId: tool.id,
        toolName: tool.name,
        output,
        executionDurationMs: duration
      };
    } catch (err: any) {
      const duration = Date.now() - startTime;
      const errorMsg = err.message || 'Unknown tool execution error';
      this.emitErrorEvent(req, errorMsg);
      return {
        success: false,
        toolId: tool.id,
        toolName: tool.name,
        output: {},
        error: errorMsg,
        executionDurationMs: duration
      };
    }
  }

  private async invokeToolHandler(
    toolId: string,
    params: Record<string, any>
  ): Promise<Record<string, any>> {
    switch (toolId) {
      case 'query_revenue_pipeline':
        return pipelineSimulation.getTelemetry();

      case 'query_system_metrics':
        const telemetry = pipelineSimulation.getTelemetry();
        return {
          cpuUsage: telemetry.status === 'healthy' ? 34 : 92,
          dbConnectionPoolUsage: telemetry.status === 'healthy' ? '28%' : '98%',
          workerSaturation: telemetry.workerSaturation,
          activeRedisLocks: telemetry.activeLocks,
          timestamp: new Date().toISOString()
        };

      case 'search_incident_history':
        const queryStr = params.query || 'revenue pipeline';
        const matches = await memoryService.searchMemory(queryStr);
        return { query: queryStr, matchesCount: matches.length, results: matches };

      case 'restart_revenue_pipeline':
        const restartResult = pipelineSimulation.restartPipeline();
        return {
          action: 'restart_revenue_pipeline',
          status: 'EXECUTED_SUCCESSFULLY',
          previousState: restartResult.previousState,
          newState: restartResult.newState,
          executedAt: new Date().toISOString()
        };

      case 'generate_incident_report':
        return {
          reportId: `rep-${Date.now()}`,
          taskId: params.taskId,
          generatedAt: new Date().toISOString(),
          status: 'SAVED_TO_AUDIT_VAULT'
        };

      default:
        throw new Error(`No execution handler registered for tool '${toolId}'`);
    }
  }

  private emitErrorEvent(req: ToolExecutionRequest, errorMsg: string): void {
    eventBus.publish({
      taskId: req.taskId,
      traceId: req.traceId,
      eventType: 'task.failed',
      agentId: req.agent.id,
      actor: req.agent.name,
      payload: { toolId: req.toolId, error: errorMsg }
    });
  }
}

export const toolGateway = new ToolGateway();
