/**
 * NEXUS - API Service Layer
 * Consumes the backend Express API endpoints.
 */

import {
  Agent,
  AgentTask,
  ApprovalRequest,
  AuditEvent,
  MemoryItem,
  SecurityPolicy,
  SystemHealth,
  ToolDefinition,
  WorkflowGraph,
  AgentMessage
} from '../types/nexus';

const API_BASE = '/api';

export interface TaskDetailsResponse {
  task: AgentTask;
  workflow: WorkflowGraph | null;
  messages: AgentMessage[];
  approvals: ApprovalRequest[];
}

async function handleResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (!res.ok) {
    let errorDetail = res.statusText || `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data && data.error) {
        errorDetail = data.error;
      }
    } catch (_) {
      // Ignore JSON parse failure
    }
    throw new Error(`${fallbackMessage}: ${errorDetail}`);
  }
  return res.json();
}

export const api = {
  // System Health
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<SystemHealth>(res, 'Health check failed');
  },

  // Agents
  async getAgents(): Promise<Agent[]> {
    const res = await fetch(`${API_BASE}/agents`);
    return handleResponse<Agent[]>(res, 'Failed to fetch agents');
  },

  async getAgent(id: string): Promise<Agent> {
    const res = await fetch(`${API_BASE}/agents/${id}`);
    return handleResponse<Agent>(res, `Failed to fetch agent ${id}`);
  },

  // Tasks
  async getTasks(): Promise<AgentTask[]> {
    const res = await fetch(`${API_BASE}/tasks`);
    return handleResponse<AgentTask[]>(res, 'Failed to fetch tasks');
  },

  async getTaskDetails(id: string): Promise<TaskDetailsResponse> {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    return handleResponse<TaskDetailsResponse>(res, `Failed to fetch task ${id}`);
  },

  async createTask(data?: { title?: string; objective?: string }): Promise<AgentTask> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    });
    return handleResponse<AgentTask>(res, 'Failed to create task');
  },

  async startTask(id: string): Promise<AgentTask> {
    const res = await fetch(`${API_BASE}/tasks/${id}/start`, { method: 'POST' });
    return handleResponse<AgentTask>(res, `Failed to start task ${id}`);
  },

  // Approvals
  async getApprovals(): Promise<ApprovalRequest[]> {
    const res = await fetch(`${API_BASE}/approvals`);
    return handleResponse<ApprovalRequest[]>(res, 'Failed to fetch approvals');
  },

  async approveRequest(id: string, decidedBy = 'Human Operator'): Promise<{ message: string; approval: ApprovalRequest; taskId: string }> {
    const res = await fetch(`${API_BASE}/approvals/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decidedBy })
    });
    return handleResponse<{ message: string; approval: ApprovalRequest; taskId: string }>(res, `Failed to approve request ${id}`);
  },

  async rejectRequest(id: string, reason: string, decidedBy = 'Human Operator'): Promise<{ message: string; approval: ApprovalRequest; taskId: string }> {
    const res = await fetch(`${API_BASE}/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, decidedBy })
    });
    return handleResponse<{ message: string; approval: ApprovalRequest; taskId: string }>(res, `Failed to reject request ${id}`);
  },

  // Tools, Memory, Audit
  async getTools(): Promise<ToolDefinition[]> {
    const res = await fetch(`${API_BASE}/tools`);
    return handleResponse<ToolDefinition[]>(res, 'Failed to fetch tools');
  },

  async getMemory(query?: string): Promise<MemoryItem[]> {
    const url = query ? `${API_BASE}/memory?q=${encodeURIComponent(query)}` : `${API_BASE}/memory`;
    const res = await fetch(url);
    return handleResponse<MemoryItem[]>(res, 'Failed to fetch memory');
  },

  async getAudit(limit = 100): Promise<AuditEvent[]> {
    const res = await fetch(`${API_BASE}/audit?limit=${limit}`);
    return handleResponse<AuditEvent[]>(res, 'Failed to fetch audit logs');
  },

  // Scenario Controls
  async triggerDemo(): Promise<{ message: string; taskId: string; traceId: string; status: string }> {
    const res = await fetch(`${API_BASE}/demo/trigger`, { method: 'POST' });
    return handleResponse<{ message: string; taskId: string; traceId: string; status: string }>(res, 'Failed to trigger demo');
  },

  async resetDemo(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    return handleResponse<{ message: string }>(res, 'Failed to reset demo');
  }
};
