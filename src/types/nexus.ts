/**
 * NEXUS - Canonical Data Model Definitions
 * Strictly aligned with 08_DATA_MODEL.md and Enterprise Agent OS specifications.
 */

export type AgentStatus = 'active' | 'busy' | 'idle' | 'paused' | 'error' | 'offline';

export type AgentRole =
  | 'orchestrator'
  | 'diagnostic'
  | 'research'
  | 'security'
  | 'operations'
  | 'reporting';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  version: string;
  model: string;
  status: AgentStatus;
  capabilities: string[];
  permissions: string[];
  owner: string;
  systemPrompt: string;
  lastActive: string;
  createdAt: string;
  currentTaskId?: string;
}

export type TaskStatus =
  | 'CREATED'
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING'
  | 'AWAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AgentTask {
  id: string;
  traceId: string;
  title: string;
  objective: string;
  scenario: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgentId?: string;
  currentStepIndex: number;
  totalSteps: number;
  assignedAgents: string[];
  progress: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export type MessageType =
  | 'finding'
  | 'context'
  | 'proposal'
  | 'decision'
  | 'report'
  | 'error'
  | 'system';

export interface AgentMessage {
  id: string;
  taskId: string;
  traceId: string;
  fromAgentId: string;
  toAgentId?: string;
  type: MessageType;
  content: string;
  payload?: Record<string, any>;
  timestamp: string;
}

export type MemoryType = 'episodic' | 'semantic' | 'operational' | 'task' | 'user';

export interface MemoryItem {
  id: string;
  agentId: string;
  taskId?: string;
  type: MemoryType;
  content: string;
  importance: number; // 0.0 to 1.0
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export type ToolRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  riskLevel: ToolRiskLevel;
  requiredPermissions: string[];
  requiresApproval: boolean;
  inputSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
}

export type PolicyDecision = 'ALLOW' | 'REQUIRES_APPROVAL' | 'DENY';

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  targetToolId: string;
  minRiskLevel: ToolRiskLevel;
  rule: string;
  decision: PolicyDecision;
  reason: string;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface ApprovalRequest {
  id: string;
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
  status: ApprovalStatus;
  policyRule: string;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  rejectionReason?: string;
}

export type AuditEventType =
  | 'task.created'
  | 'task.started'
  | 'agent.started'
  | 'agent.tool_called'
  | 'agent.finding_created'
  | 'memory.retrieved'
  | 'policy.evaluated'
  | 'approval.requested'
  | 'approval.approved'
  | 'approval.rejected'
  | 'action.executed'
  | 'verification.completed'
  | 'report.generated'
  | 'task.completed'
  | 'task.failed';

export type AuditEventStatus = 'SUCCESS' | 'WARNING' | 'FAILED' | 'INFO';

export interface AuditEvent {
  id: string;
  traceId: string;
  taskId: string;
  eventType: AuditEventType;
  agentId?: string;
  actor: string;
  target?: string;
  details: Record<string, any>;
  status: AuditEventStatus;
  timestamp: string;
}

export type WorkflowNodeStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'awaiting_approval'
  | 'skipped';

export interface WorkflowNode {
  id: string;
  label: string;
  agentId: string;
  role: AgentRole;
  status: WorkflowNodeStatus;
  toolName?: string;
  details?: string;
  outputSummary?: string;
  durationMs?: number;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface WorkflowGraph {
  id: string;
  taskId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  activeAgentsCount: number;
  runningTasksCount: number;
  pendingApprovalsCount: number;
  totalMemoriesCount: number;
  totalAuditEventsCount: number;
  uptimeSeconds: number;
}
