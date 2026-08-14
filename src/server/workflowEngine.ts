/**
 * NEXUS - Workflow State Machine Engine
 * Controls strict task workflow transitions, node status graph updates, and validation.
 */

import { memoryContainer } from '../repositories/memoryStore';
import { WorkflowGraph, WorkflowNode, TaskStatus } from '../types/nexus';
import { eventBus } from './eventBus';

export type ExtendedWorkflowState =
  | 'CREATED'
  | 'RUNNING'
  | 'DIAGNOSING'
  | 'RESEARCHING'
  | 'SECURITY_REVIEW'
  | 'AWAITING_APPROVAL'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'REPORTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED'
  | 'CANCELLED';

export class WorkflowEngine {
  async initializeWorkflow(taskId: string, traceId: string): Promise<WorkflowGraph> {
    const graph: WorkflowGraph = {
      id: `graph-${taskId}`,
      taskId,
      nodes: [
        {
          id: 'node-orchestrator',
          label: 'Orchestrator Plan',
          agentId: 'orchestrator-agent',
          role: 'orchestrator',
          status: 'pending'
        },
        {
          id: 'node-diagnostic',
          label: 'Diagnostic Anomaly Investigation',
          agentId: 'diagnostic-agent',
          role: 'diagnostic',
          status: 'pending',
          toolName: 'query_revenue_pipeline, query_system_metrics'
        },
        {
          id: 'node-research',
          label: 'Historical Context Search',
          agentId: 'research-agent',
          role: 'research',
          status: 'pending',
          toolName: 'search_incident_history'
        },
        {
          id: 'node-security',
          label: 'Governance & Risk Assessment',
          agentId: 'security-agent',
          role: 'security',
          status: 'pending'
        },
        {
          id: 'node-approval',
          label: 'Human-in-the-Loop Approval Gate',
          agentId: 'security-agent',
          role: 'security',
          status: 'pending'
        },
        {
          id: 'node-operations',
          label: 'Execute System Remediation',
          agentId: 'operations-agent',
          role: 'operations',
          status: 'pending',
          toolName: 'restart_revenue_pipeline'
        },
        {
          id: 'node-verification',
          label: 'Recovery Verification Engine',
          agentId: 'diagnostic-agent',
          role: 'diagnostic',
          status: 'pending'
        },
        {
          id: 'node-reporting',
          label: 'Audit & Post-Mortem Compilation',
          agentId: 'reporting-agent',
          role: 'reporting',
          status: 'pending',
          toolName: 'generate_incident_report'
        }
      ],
      edges: [
        { id: 'e1', source: 'node-orchestrator', target: 'node-diagnostic' },
        { id: 'e2', source: 'node-diagnostic', target: 'node-research' },
        { id: 'e3', source: 'node-research', target: 'node-security' },
        { id: 'e4', source: 'node-security', target: 'node-approval' },
        { id: 'e5', source: 'node-approval', target: 'node-operations' },
        { id: 'e6', source: 'node-operations', target: 'node-verification' },
        { id: 'e7', source: 'node-verification', target: 'node-reporting' }
      ]
    };

    await memoryContainer.workflows.save(graph);
    return graph;
  }

  async updateStep(
    taskId: string,
    nodeId: string,
    status: WorkflowNode['status'],
    details?: string,
    outputSummary?: string
  ): Promise<WorkflowGraph | null> {
    return memoryContainer.workflows.updateNodeStatus(taskId, nodeId, status, details, outputSummary);
  }

  async setTaskState(taskId: string, status: TaskStatus, error?: string): Promise<void> {
    await memoryContainer.tasks.updateStatus(taskId, status, error);
  }
}

export const workflowEngine = new WorkflowEngine();
