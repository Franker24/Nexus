/**
 * NEXUS - Central Orchestrator Engine
 * Coordinates the end-to-end golden path workflow across specialized agents,
 * managing policy evaluation, human approval pause/resume, execution, verification, and reporting.
 */

import { memoryContainer } from '../repositories/memoryStore';
import { AgentTask } from '../types/nexus';
import { eventBus } from './eventBus';
import { workflowEngine } from './workflowEngine';
import { orchestratorAgent } from './agents/orchestratorAgent';
import { diagnosticAgent } from './agents/diagnosticAgent';
import { researchAgent } from './agents/researchAgent';
import { securityAgent } from './agents/securityAgent';
import { operationsAgent } from './agents/operationsAgent';
import { reportingAgent } from './agents/reportingAgent';
import { approvalService } from './approvalService';
import { verificationService } from './verificationService';

export class NexusOrchestrator {
  private activeTaskContexts: Map<string, Record<string, any>> = new Map();

  async createRevenueIncidentTask(): Promise<AgentTask> {
    const traceId = `trace-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const task = await memoryContainer.tasks.create({
      traceId,
      title: 'Revenue Operations Incident: Ingestion Pipeline Stall',
      objective: 'Investigate payment ingestion stall on Revenue Pipeline #1, identify root cause, retrieve historical resolution context, evaluate remediation policy, obtain human approval, execute restart, verify recovery, and compile audit report.',
      scenario: 'Revenue Operations Incident',
      status: 'CREATED',
      priority: 'critical',
      currentStepIndex: 0,
      totalSteps: 8,
      assignedAgents: [
        'orchestrator-agent',
        'diagnostic-agent',
        'research-agent',
        'security-agent',
        'operations-agent',
        'reporting-agent'
      ],
      progress: 0,
      createdBy: 'System Trigger'
    });

    await workflowEngine.initializeWorkflow(task.id, traceId);

    eventBus.publish({
      taskId: task.id,
      traceId,
      eventType: 'task.created',
      actor: 'System Event Detector',
      payload: { taskId: task.id, title: task.title, priority: task.priority }
    });

    return task;
  }

  async runWorkflow(taskId: string): Promise<AgentTask> {
    const task = await memoryContainer.tasks.getById(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found`);
    }

    const traceId = task.traceId;
    await workflowEngine.setTaskState(taskId, 'RUNNING');

    eventBus.publish({
      taskId,
      traceId,
      eventType: 'task.started',
      actor: 'Nexus Orchestrator',
      payload: { taskId, status: 'RUNNING' }
    });

    const sharedContext: Record<string, any> = {};
    this.activeTaskContexts.set(taskId, sharedContext);

    try {
      // Step 1: Orchestrator Plan
      await workflowEngine.updateStep(taskId, 'node-orchestrator', 'running');
      const planRes = await orchestratorAgent.execute({
        taskId,
        traceId,
        objective: task.objective,
        sharedContext
      });
      sharedContext.plan = planRes.plan;
      await workflowEngine.updateStep(
        taskId,
        'node-orchestrator',
        'completed',
        'Objective decomposed into multi-agent plan',
        `Plan created with ${planRes.plan?.length || 5} steps.`
      );
      await memoryContainer.tasks.update(taskId, { progress: 15, currentStepIndex: 1 });

      // Step 2: Diagnostic Agent
      await workflowEngine.updateStep(taskId, 'node-diagnostic', 'running');
      const diagRes = await diagnosticAgent.execute({
        taskId,
        traceId,
        objective: task.objective,
        sharedContext
      });
      sharedContext.diagnostic = diagRes;
      await workflowEngine.updateStep(
        taskId,
        'node-diagnostic',
        'completed',
        'Telemetry analyzed and root cause identified',
        diagRes.finding
      );
      await memoryContainer.tasks.update(taskId, { progress: 35, currentStepIndex: 2 });

      // Step 3: Research Agent
      await workflowEngine.updateStep(taskId, 'node-research', 'running');
      const researchRes = await researchAgent.execute({
        taskId,
        traceId,
        objective: task.objective,
        sharedContext
      });
      sharedContext.research = researchRes;
      await workflowEngine.updateStep(
        taskId,
        'node-research',
        'completed',
        'Memory records retrieved',
        researchRes.summary
      );
      await memoryContainer.tasks.update(taskId, { progress: 50, currentStepIndex: 3 });

      // Step 4: Security Agent & Policy Evaluation
      await workflowEngine.updateStep(taskId, 'node-security', 'running');
      const secRes = await securityAgent.execute({
        taskId,
        traceId,
        objective: task.objective,
        sharedContext
      });
      sharedContext.security = secRes;
      await workflowEngine.updateStep(
        taskId,
        'node-security',
        'completed',
        `Policy check complete: ${secRes.decision}`,
        secRes.reason
      );
      await memoryContainer.tasks.update(taskId, { progress: 65, currentStepIndex: 4 });

      // Step 5: Human Approval Pause
      if (secRes.requiresHumanApproval || secRes.decision === 'REQUIRES_APPROVAL') {
        await workflowEngine.updateStep(
          taskId,
          'node-approval',
          'awaiting_approval',
          'Awaiting explicit human authorization to restart financial revenue pipeline'
        );

        const approvalReq = await approvalService.createRequest({
          taskId,
          traceId,
          agentId: 'operations-agent',
          toolId: secRes.targetToolId,
          toolParams: { pipelineId: 'rev-pipe-prod-01', forceResetLocks: true },
          actionDescription: `Restart Revenue Pipeline #1 and clear 142 stale queue locks`,
          reason: secRes.reason,
          riskLevel: secRes.riskLevel,
          evidence: diagRes.evidence,
          affectedResource: secRes.affectedResource,
          policyRule: secRes.policyRule
        });

        sharedContext.approvalId = approvalReq.id;
        await workflowEngine.setTaskState(taskId, 'AWAITING_APPROVAL');

        const updatedTask = await memoryContainer.tasks.getById(taskId);
        return updatedTask!;
      } else {
        // If no approval required, continue directly
        return this.resumeWorkflow(taskId);
      }
    } catch (err: any) {
      console.error(`[Orchestrator] Task ${taskId} failed:`, err);
      await workflowEngine.setTaskState(taskId, 'FAILED', err.message);
      const updatedTask = await memoryContainer.tasks.getById(taskId);
      return updatedTask!;
    }
  }

  async resumeWorkflow(taskId: string, approvalId?: string): Promise<AgentTask> {
    const task = await memoryContainer.tasks.getById(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found`);
    }

    const traceId = task.traceId;
    const sharedContext = this.activeTaskContexts.get(taskId) || {};
    if (approvalId) {
      sharedContext.approvalId = approvalId;
    }

    await workflowEngine.setTaskState(taskId, 'RUNNING');

    try {
      // Step 5 Complete: Approval Granted
      await workflowEngine.updateStep(
        taskId,
        'node-approval',
        'completed',
        'Human operator approved operation execution',
        'Approved by Human Operator'
      );
      await memoryContainer.tasks.update(taskId, { progress: 75, currentStepIndex: 5 });

      // Step 6: Operations Agent
      await workflowEngine.updateStep(taskId, 'node-operations', 'running');
      const opsRes = await operationsAgent.execute({
        taskId,
        traceId,
        objective: task.objective,
        sharedContext,
        approvalId: sharedContext.approvalId
      });
      sharedContext.operations = opsRes;

      if (!opsRes.success) {
        throw new Error(`Operations Agent failed execution: ${opsRes.error}`);
      }

      await workflowEngine.updateStep(
        taskId,
        'node-operations',
        'completed',
        'Pipeline restart tool executed successfully',
        `Executed ${opsRes.toolName} in ${opsRes.executionDurationMs}ms.`
      );
      await memoryContainer.tasks.update(taskId, { progress: 85, currentStepIndex: 6 });

      // Step 7: Verification Engine
      await workflowEngine.updateStep(taskId, 'node-verification', 'running');
      const verifyRes = await verificationService.verifyRecovery(taskId, traceId);
      sharedContext.verification = verifyRes;

      if (!verifyRes.verified) {
        throw new Error(`Recovery verification failed: ${verifyRes.message}`);
      }

      await workflowEngine.updateStep(
        taskId,
        'node-verification',
        'completed',
        'Recovery verified healthy',
        verifyRes.message
      );
      await memoryContainer.tasks.update(taskId, { progress: 95, currentStepIndex: 7 });

      // Step 8: Reporting Agent
      await workflowEngine.updateStep(taskId, 'node-reporting', 'running');
      const reportRes = await reportingAgent.execute({
        taskId,
        traceId,
        objective: task.objective,
        sharedContext
      });
      sharedContext.reporting = reportRes;

      await workflowEngine.updateStep(
        taskId,
        'node-reporting',
        'completed',
        'Post-mortem incident report archived',
        reportRes.title
      );

      // Task Completed
      await memoryContainer.tasks.update(taskId, { progress: 100, currentStepIndex: 8 });
      await workflowEngine.setTaskState(taskId, 'COMPLETED');

      eventBus.publish({
        taskId,
        traceId,
        eventType: 'task.completed',
        actor: 'Nexus Orchestrator',
        payload: { taskId, status: 'COMPLETED', reportId: reportRes.reportId }
      });

      const completedTask = await memoryContainer.tasks.getById(taskId);
      return completedTask!;
    } catch (err: any) {
      console.error(`[Orchestrator] Task ${taskId} resume failed:`, err);
      await workflowEngine.setTaskState(taskId, 'FAILED', err.message);
      const failedTask = await memoryContainer.tasks.getById(taskId);
      return failedTask!;
    }
  }

  async handleRejection(taskId: string, rejectionReason: string): Promise<AgentTask> {
    const task = await memoryContainer.tasks.getById(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found`);
    }

    await workflowEngine.updateStep(
      taskId,
      'node-approval',
      'failed',
      `Approval REJECTED by Human Operator: ${rejectionReason}`
    );

    await workflowEngine.updateStep(
      taskId,
      'node-operations',
      'skipped',
      'Execution blocked by security rejection'
    );

    await workflowEngine.setTaskState(taskId, 'FAILED', `Human operator rejected action: ${rejectionReason}`);

    eventBus.publish({
      taskId,
      traceId: task.traceId,
      eventType: 'task.failed',
      actor: 'Human Operator',
      payload: { taskId, reason: rejectionReason }
    });

    const updatedTask = await memoryContainer.tasks.getById(taskId);
    return updatedTask!;
  }
}

export const orchestrator = new NexusOrchestrator();
