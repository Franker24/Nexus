/**
 * NEXUS - Server-Side Deterministic In-Memory Repository
 * Provides clean initial state, seed data, and deterministic operations
 * for live hackathon demonstrations.
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

import {
  IAgentRepository,
  ITaskRepository,
  IMessageRepository,
  IMemoryRepository,
  IToolRepository,
  IPolicyRepository,
  IApprovalRepository,
  IAuditRepository,
  IWorkflowRepository,
  INexusRepositoryContainer
} from './interfaces';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// --- INITIAL SEED DATA ---

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'orchestrator-agent',
    name: 'Nexus Orchestrator',
    role: 'orchestrator',
    description: 'Central task decomposition and multi-agent coordination engine.',
    version: '1.2.0',
    model: DEFAULT_MODEL,
    status: 'idle',
    capabilities: ['objective-decomposition', 'workflow-management', 'agent-delegation'],
    permissions: ['task:create', 'task:assign', 'agent:coordinate', 'workflow:manage'],
    owner: 'Enterprise Ops',
    systemPrompt: 'You are the NEXUS Orchestrator Agent. Decompose operational goals into structured workflow steps.',
    lastActive: new Date().toISOString(),
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'diagnostic-agent',
    name: 'Diagnostic Specialist',
    role: 'diagnostic',
    description: 'Investigates operational anomalies, queue stalls, and performance telemetry.',
    version: '1.1.4',
    model: DEFAULT_MODEL,
    status: 'idle',
    capabilities: ['anomaly-detection', 'metrics-query', 'queue-analysis', 'root-cause-identification'],
    permissions: ['read:incidents', 'read:analytics', 'read:metrics', 'execute:diagnostics'],
    owner: 'Reliability Engineering',
    systemPrompt: 'You are the NEXUS Diagnostic Agent. Analyze metrics and logs to pinpoint root causes.',
    lastActive: new Date().toISOString(),
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'research-agent',
    name: 'Context & Research Agent',
    role: 'research',
    description: 'Queries enterprise historical context, memory archives, and post-mortems.',
    version: '1.0.8',
    model: DEFAULT_MODEL,
    status: 'idle',
    capabilities: ['semantic-search', 'pattern-matching', 'context-synthesis'],
    permissions: ['read:memory', 'read:incident-history', 'read:documents'],
    owner: 'Knowledge Management',
    systemPrompt: 'You are the NEXUS Research Agent. Find historical resolution patterns in company archives.',
    lastActive: new Date().toISOString(),
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'security-agent',
    name: 'Governance & Security Agent',
    role: 'security',
    description: 'Evaluates security policies, tool risk levels, and human approval gates.',
    version: '2.0.1',
    model: DEFAULT_MODEL,
    status: 'idle',
    capabilities: ['policy-evaluation', 'risk-assessment', 'approval-gatekeeping'],
    permissions: ['read:policies', 'evaluate:risk', 'manage:approvals'],
    owner: 'InfoSec & Compliance',
    systemPrompt: 'You are the NEXUS Security Agent. Evaluate proposed operations against security rules.',
    lastActive: new Date().toISOString(),
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'operations-agent',
    name: 'System Operations Agent',
    role: 'operations',
    description: 'Executes authorized operational tools and system remediation scripts.',
    version: '1.3.0',
    model: DEFAULT_MODEL,
    status: 'idle',
    capabilities: ['tool-execution', 'pipeline-management', 'system-remediation'],
    permissions: ['execute:pipeline-restart', 'execute:dlq-flush', 'execute:service-reset'],
    owner: 'Infrastructure Ops',
    systemPrompt: 'You are the NEXUS Operations Agent. Safely execute approved tool commands.',
    lastActive: new Date().toISOString(),
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'reporting-agent',
    name: 'Audit & Reporting Agent',
    role: 'reporting',
    description: 'Synthesizes multi-agent evidence into auditable incident post-mortems.',
    version: '1.0.2',
    model: DEFAULT_MODEL,
    status: 'idle',
    capabilities: ['incident-summarization', 'post-mortem-generation', 'audit-formatting'],
    permissions: ['read:all-task-data', 'write:reports', 'write:audit'],
    owner: 'Governance Office',
    systemPrompt: 'You are the NEXUS Reporting Agent. Synthesize execution history into structured post-mortems.',
    lastActive: new Date().toISOString(),
    createdAt: '2026-08-01T00:00:00Z'
  }
];

export const INITIAL_TOOLS: ToolDefinition[] = [
  {
    id: 'query_revenue_pipeline',
    name: 'Query Revenue Pipeline',
    description: 'Retrieves current ingested payment transaction rate, worker health, and DLQ message count.',
    riskLevel: 'low',
    requiredPermissions: ['read:analytics', 'read:metrics'],
    requiresApproval: false,
    inputSchema: { pipelineId: 'string' }
  },
  {
    id: 'search_incident_history',
    name: 'Search Historical Incidents',
    description: 'Searches historical incident post-mortems and memory records for related resolutions.',
    riskLevel: 'low',
    requiredPermissions: ['read:memory', 'read:incident-history'],
    requiresApproval: false,
    inputSchema: { query: 'string', tags: 'array' }
  },
  {
    id: 'query_system_metrics',
    name: 'Query System Metrics',
    description: 'Retrieves CPU, DB connection pool, and worker concurrency metrics.',
    riskLevel: 'low',
    requiredPermissions: ['read:metrics'],
    requiresApproval: false,
    inputSchema: { timeRange: 'string' }
  },
  {
    id: 'restart_revenue_pipeline',
    name: 'Restart Revenue Pipeline',
    description: 'Restarts stalled worker pods and flushes stuck queue locks on revenue pipeline infrastructure.',
    riskLevel: 'high',
    requiredPermissions: ['execute:pipeline-restart'],
    requiresApproval: true,
    inputSchema: { pipelineId: 'string', forceResetLocks: 'boolean' }
  },
  {
    id: 'generate_incident_report',
    name: 'Generate Incident Report',
    description: 'Compiles final incident resolution report and persists into audit vault.',
    riskLevel: 'low',
    requiredPermissions: ['write:reports'],
    requiresApproval: false,
    inputSchema: { taskId: 'string', format: 'string' }
  }
];

export const INITIAL_POLICIES: SecurityPolicy[] = [
  {
    id: 'pol-01',
    name: 'Financial Infrastructure Restart Policy',
    description: 'High-risk operational tools affecting financial revenue streams require explicit human approval.',
    targetToolId: 'restart_revenue_pipeline',
    minRiskLevel: 'high',
    rule: 'IF tool.riskLevel >= HIGH AND tool.category == FINANCIAL_PIPELINE THEN decision = REQUIRES_APPROVAL',
    decision: 'REQUIRES_APPROVAL',
    reason: 'Operational safeguard preventing autonomous restarts of core revenue ingestion workers without human authorization.'
  }
];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-101',
    agentId: 'research-agent',
    type: 'episodic',
    content: 'Incident INC-2025-11-04: Revenue pipeline stalled due to stuck Redis distributed locks during webhook burst. Resolution: Cleared Redis worker locks and restarted ingestion worker pool.',
    importance: 0.95,
    tags: ['revenue-pipeline', 'redis-lock', 'webhook-burst', 'post-mortem'],
    createdAt: '2025-11-04T14:30:00Z'
  },
  {
    id: 'mem-102',
    agentId: 'diagnostic-agent',
    type: 'operational',
    content: 'Standard baseline metrics for Revenue Pipeline #1: 4,500 tx/min. Warning threshold: < 500 tx/min. Critical threshold: 0 tx/min with backlogged queue > 10,000 pending items.',
    importance: 0.88,
    tags: ['baseline', 'revenue-pipeline', 'thresholds'],
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'mem-103',
    agentId: 'security-agent',
    type: 'semantic',
    content: 'Policy Guideline SEC-88: Operations Agent MUST NOT execute high-risk state changes without an active ApprovalRequest signed by an authorized human operator.',
    importance: 0.99,
    tags: ['compliance', 'governance', 'policy-sec-88'],
    createdAt: '2026-02-01T00:00:00Z'
  }
];

// --- REPOSITORY IMPLEMENTATIONS ---

class AgentRepository implements IAgentRepository {
  private agents: Map<string, Agent> = new Map();

  constructor(initial: Agent[]) {
    initial.forEach((a) => this.agents.set(a.id, { ...a }));
  }

  async getAll(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getById(id: string): Promise<Agent | null> {
    const a = this.agents.get(id);
    return a ? { ...a } : null;
  }

  async updateStatus(id: string, status: Agent['status'], currentTaskId?: string): Promise<Agent | null> {
    const a = this.agents.get(id);
    if (!a) return null;
    a.status = status;
    a.lastActive = new Date().toISOString();
    if (currentTaskId !== undefined) {
      a.currentTaskId = currentTaskId;
    }
    return { ...a };
  }

  async save(agent: Agent): Promise<Agent> {
    this.agents.set(agent.id, { ...agent });
    return { ...agent };
  }
}

class TaskRepository implements ITaskRepository {
  private tasks: Map<string, AgentTask> = new Map();

  async getAll(): Promise<AgentTask[]> {
    return Array.from(this.tasks.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getById(id: string): Promise<AgentTask | null> {
    const t = this.tasks.get(id);
    return t ? { ...t } : null;
  }

  async create(task: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentTask> {
    const id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newTask: AgentTask = {
      ...task,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(id, newTask);
    return { ...newTask };
  }

  async update(id: string, updates: Partial<AgentTask>): Promise<AgentTask | null> {
    const t = this.tasks.get(id);
    if (!t) return null;
    const updated: AgentTask = {
      ...t,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.tasks.set(id, updated);
    return { ...updated };
  }

  async updateStatus(id: string, status: TaskStatus, error?: string): Promise<AgentTask | null> {
    const t = this.tasks.get(id);
    if (!t) return null;
    t.status = status;
    t.updatedAt = new Date().toISOString();
    if (error) t.error = error;
    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
      t.completedAt = new Date().toISOString();
    }
    return { ...t };
  }
}

class MessageRepository implements IMessageRepository {
  private messages: AgentMessage[] = [];

  async getByTaskId(taskId: string): Promise<AgentMessage[]> {
    return this.messages.filter((m) => m.taskId === taskId);
  }

  async add(message: Omit<AgentMessage, 'id' | 'timestamp'>): Promise<AgentMessage> {
    const newMsg: AgentMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.messages.push(newMsg);
    return { ...newMsg };
  }
}

class MemoryRepository implements IMemoryRepository {
  private memories: MemoryItem[] = [];

  constructor(initial: MemoryItem[]) {
    this.memories = [...initial];
  }

  async getAll(): Promise<MemoryItem[]> {
    return [...this.memories];
  }

  async getByAgentId(agentId: string): Promise<MemoryItem[]> {
    return this.memories.filter((m) => m.agentId === agentId);
  }

  async query(queryText: string, limit = 5): Promise<MemoryItem[]> {
    const q = queryText.toLowerCase();
    const matches = this.memories.filter((m) =>
      m.content.toLowerCase().includes(q) || m.tags.some((t) => t.toLowerCase().includes(q))
    );
    return matches.slice(0, limit);
  }

  async add(memory: Omit<MemoryItem, 'id' | 'createdAt'>): Promise<MemoryItem> {
    const newMem: MemoryItem = {
      ...memory,
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.memories.push(newMem);
    return { ...newMem };
  }
}

class ToolRepository implements IToolRepository {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor(initial: ToolDefinition[]) {
    initial.forEach((t) => this.tools.set(t.id, { ...t }));
  }

  async getAll(): Promise<ToolDefinition[]> {
    return Array.from(this.tools.values());
  }

  async getById(id: string): Promise<ToolDefinition | null> {
    const t = this.tools.get(id);
    return t ? { ...t } : null;
  }
}

class PolicyRepository implements IPolicyRepository {
  private policies: Map<string, SecurityPolicy> = new Map();

  constructor(initial: SecurityPolicy[]) {
    initial.forEach((p) => this.policies.set(p.id, { ...p }));
  }

  async getAll(): Promise<SecurityPolicy[]> {
    return Array.from(this.policies.values());
  }

  async getByToolId(toolId: string): Promise<SecurityPolicy | null> {
    for (const p of this.policies.values()) {
      if (p.targetToolId === toolId) return { ...p };
    }
    return null;
  }
}

class ApprovalRepository implements IApprovalRepository {
  private approvals: Map<string, ApprovalRequest> = new Map();

  async getAll(): Promise<ApprovalRequest[]> {
    return Array.from(this.approvals.values()).sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  async getPending(): Promise<ApprovalRequest[]> {
    return Array.from(this.approvals.values()).filter((a) => a.status === 'PENDING');
  }

  async getById(id: string): Promise<ApprovalRequest | null> {
    const a = this.approvals.get(id);
    return a ? { ...a } : null;
  }

  async getByTaskId(taskId: string): Promise<ApprovalRequest[]> {
    return Array.from(this.approvals.values()).filter((a) => a.taskId === taskId);
  }

  async create(approval: Omit<ApprovalRequest, 'id' | 'requestedAt'>): Promise<ApprovalRequest> {
    const id = `appr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newAppr: ApprovalRequest = {
      ...approval,
      id,
      requestedAt: new Date().toISOString()
    };
    this.approvals.set(id, newAppr);
    return { ...newAppr };
  }

  async updateStatus(
    id: string,
    status: ApprovalStatus,
    decidedBy: string,
    rejectionReason?: string
  ): Promise<ApprovalRequest | null> {
    const a = this.approvals.get(id);
    if (!a) return null;
    a.status = status;
    a.decidedAt = new Date().toISOString();
    a.decidedBy = decidedBy;
    if (rejectionReason) a.rejectionReason = rejectionReason;
    return { ...a };
  }
}

class AuditRepository implements IAuditRepository {
  private events: AuditEvent[] = [];

  async getAll(limit = 100): Promise<AuditEvent[]> {
    return [...this.events]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getByTraceId(traceId: string): Promise<AuditEvent[]> {
    return this.events.filter((e) => e.traceId === traceId);
  }

  async getByTaskId(taskId: string): Promise<AuditEvent[]> {
    return this.events.filter((e) => e.taskId === taskId);
  }

  async add(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent> {
    const newEvt: AuditEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString()
    };
    this.events.push(newEvt);
    return { ...newEvt };
  }
}

class WorkflowRepository implements IWorkflowRepository {
  private graphs: Map<string, WorkflowGraph> = new Map();

  async getByTaskId(taskId: string): Promise<WorkflowGraph | null> {
    const g = this.graphs.get(taskId);
    return g ? JSON.parse(JSON.stringify(g)) : null;
  }

  async save(workflow: WorkflowGraph): Promise<WorkflowGraph> {
    this.graphs.set(workflow.taskId, JSON.parse(JSON.stringify(workflow)));
    return JSON.parse(JSON.stringify(workflow));
  }

  async updateNodeStatus(
    taskId: string,
    nodeId: string,
    status: WorkflowGraph['nodes'][0]['status'],
    details?: string,
    outputSummary?: string
  ): Promise<WorkflowGraph | null> {
    const g = this.graphs.get(taskId);
    if (!g) return null;
    const node = g.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.status = status;
      if (details) node.details = details;
      if (outputSummary) node.outputSummary = outputSummary;
    }
    return JSON.parse(JSON.stringify(g));
  }
}

// --- CONTAINER IMPLEMENTATION ---

export class NexusMemoryRepositoryContainer implements INexusRepositoryContainer {
  agents: IAgentRepository;
  tasks: ITaskRepository;
  messages: IMessageRepository;
  memories: IMemoryRepository;
  tools: IToolRepository;
  policies: IPolicyRepository;
  approvals: IApprovalRepository;
  audit: IAuditRepository;
  workflows: IWorkflowRepository;

  constructor() {
    this.agents = new AgentRepository(INITIAL_AGENTS);
    this.tasks = new TaskRepository();
    this.messages = new MessageRepository();
    this.memories = new MemoryRepository(INITIAL_MEMORIES);
    this.tools = new ToolRepository(INITIAL_TOOLS);
    this.policies = new PolicyRepository(INITIAL_POLICIES);
    this.approvals = new ApprovalRepository();
    this.audit = new AuditRepository();
    this.workflows = new WorkflowRepository();
  }

  async resetToDefaultScenario(): Promise<void> {
    this.agents = new AgentRepository(INITIAL_AGENTS);
    this.tasks = new TaskRepository();
    this.messages = new MessageRepository();
    this.memories = new MemoryRepository(INITIAL_MEMORIES);
    this.tools = new ToolRepository(INITIAL_TOOLS);
    this.policies = new PolicyRepository(INITIAL_POLICIES);
    this.approvals = new ApprovalRepository();
    this.audit = new AuditRepository();
    this.workflows = new WorkflowRepository();
  }
}

// Singleton instance for in-memory server state
export const memoryContainer = new NexusMemoryRepositoryContainer();
