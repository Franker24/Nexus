/**
 * NEXUS - Repository Interfaces Abstraction Layer
 * Standardizes repository access so Firestore / SQL stores can be plugged in
 * seamlessly without breaking business logic or frontend contracts.
 */

import {
  Agent,
  AgentTask,
  AgentMessage,
  MemoryItem,
  ToolDefinition,
  SecurityPolicy,
  ApprovalRequest,
  AuditEvent,
  WorkflowGraph,
  TaskStatus,
  ApprovalStatus,
  AuditEventType
} from '../types/nexus';

export interface IAgentRepository {
  getAll(): Promise<Agent[]>;
  getById(id: string): Promise<Agent | null>;
  updateStatus(id: string, status: Agent['status'], currentTaskId?: string): Promise<Agent | null>;
  save(agent: Agent): Promise<Agent>;
}

export interface ITaskRepository {
  getAll(): Promise<AgentTask[]>;
  getById(id: string): Promise<AgentTask | null>;
  create(task: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentTask>;
  update(id: string, updates: Partial<AgentTask>): Promise<AgentTask | null>;
  updateStatus(id: string, status: TaskStatus, error?: string): Promise<AgentTask | null>;
}

export interface IMessageRepository {
  getByTaskId(taskId: string): Promise<AgentMessage[]>;
  add(message: Omit<AgentMessage, 'id' | 'timestamp'>): Promise<AgentMessage>;
}

export interface IMemoryRepository {
  getAll(): Promise<MemoryItem[]>;
  getByAgentId(agentId: string): Promise<MemoryItem[]>;
  query(queryText: string, limit?: number): Promise<MemoryItem[]>;
  add(memory: Omit<MemoryItem, 'id' | 'createdAt'>): Promise<MemoryItem>;
}

export interface IToolRepository {
  getAll(): Promise<ToolDefinition[]>;
  getById(id: string): Promise<ToolDefinition | null>;
}

export interface IPolicyRepository {
  getAll(): Promise<SecurityPolicy[]>;
  getByToolId(toolId: string): Promise<SecurityPolicy | null>;
}

export interface IApprovalRepository {
  getAll(): Promise<ApprovalRequest[]>;
  getPending(): Promise<ApprovalRequest[]>;
  getById(id: string): Promise<ApprovalRequest | null>;
  getByTaskId(taskId: string): Promise<ApprovalRequest[]>;
  create(approval: Omit<ApprovalRequest, 'id' | 'requestedAt'>): Promise<ApprovalRequest>;
  updateStatus(
    id: string,
    status: ApprovalStatus,
    decidedBy: string,
    rejectionReason?: string
  ): Promise<ApprovalRequest | null>;
}

export interface IAuditRepository {
  getAll(limit?: number): Promise<AuditEvent[]>;
  getByTraceId(traceId: string): Promise<AuditEvent[]>;
  getByTaskId(taskId: string): Promise<AuditEvent[]>;
  add(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent>;
}

export interface IWorkflowRepository {
  getByTaskId(taskId: string): Promise<WorkflowGraph | null>;
  save(workflow: WorkflowGraph): Promise<WorkflowGraph>;
  updateNodeStatus(
    taskId: string,
    nodeId: string,
    status: WorkflowGraph['nodes'][0]['status'],
    details?: string,
    outputSummary?: string
  ): Promise<WorkflowGraph | null>;
}

export interface INexusRepositoryContainer {
  agents: IAgentRepository;
  tasks: ITaskRepository;
  messages: IMessageRepository;
  memories: IMemoryRepository;
  tools: IToolRepository;
  policies: IPolicyRepository;
  approvals: IApprovalRepository;
  audit: IAuditRepository;
  workflows: IWorkflowRepository;
  resetToDefaultScenario(): Promise<void>;
}
