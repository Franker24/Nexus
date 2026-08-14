/**
 * NEXUS - Central State Management & Context Provider
 * Syncs REST backend state and SSE events into live, reactive frontend state.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Agent,
  AgentTask,
  ApprovalRequest,
  AuditEvent,
  MemoryItem,
  SystemHealth,
  ToolDefinition,
  WorkflowGraph,
  AgentMessage
} from '../types/nexus';
import { api } from '../services/api';
import { sseClient } from '../services/sse';
import { NexusTaskEvent } from '../server/eventBus';

export type NexusRoute = 'mission' | 'agents' | 'workflows' | 'approvals' | 'memory' | 'audit';

interface NexusContextType {
  agents: Agent[];
  tasks: AgentTask[];
  activeTask: AgentTask | null;
  activeWorkflow: WorkflowGraph | null;
  activeMessages: AgentMessage[];
  activeApprovals: ApprovalRequest[];
  pendingApprovals: ApprovalRequest[];
  memories: MemoryItem[];
  auditLogs: AuditEvent[];
  tools: ToolDefinition[];
  health: SystemHealth | null;
  liveEvents: NexusTaskEvent[];
  activeRoute: NexusRoute;
  selectedNodeId: string | null;
  selectedTraceId: string | null;
  isTriggering: boolean;
  isResetting: boolean;
  isLoading: boolean;
  isSseConnected: boolean;
  demoNotification: { title: string; subtitle: string; traceId: string } | null;
  error: string | null;

  // Actions
  setActiveRoute: (route: NexusRoute) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedTraceId: (traceId: string | null) => void;
  openTraceExplorer: (traceId: string) => void;
  dismissNotification: () => void;
  reconnectSse: () => void;
  selectTask: (taskId: string) => Promise<void>;
  triggerScenario: () => Promise<void>;
  resetScenario: () => Promise<void>;
  approveAction: (approvalId: string, decidedBy?: string) => Promise<void>;
  rejectAction: (approvalId: string, reason: string, decidedBy?: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const NexusContext = createContext<NexusContextType | null>(null);

export const NexusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [activeTask, setActiveTask] = useState<AgentTask | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowGraph | null>(null);
  const [activeMessages, setActiveMessages] = useState<AgentMessage[]>([]);
  const [activeApprovals, setActiveApprovals] = useState<ApprovalRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [liveEvents, setLiveEvents] = useState<NexusTaskEvent[]>([]);

  const [activeRoute, setActiveRoute] = useState<NexusRoute>('mission');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);

  const [isTriggering, setIsTriggering] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSseConnected, setIsSseConnected] = useState(true);
  const [demoNotification, setDemoNotification] = useState<{ title: string; subtitle: string; traceId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openTraceExplorer = useCallback((traceId: string) => {
    setSelectedTraceId(traceId);
    setActiveRoute('audit');
  }, []);

  const dismissNotification = useCallback(() => {
    setDemoNotification(null);
  }, []);

  const reconnectSse = useCallback(() => {
    sseClient.connect(activeTask?.id);
  }, [activeTask]);

  const loadTaskDetails = useCallback(async (taskId: string) => {
    if (!taskId) return;
    try {
      const details = await api.getTaskDetails(taskId);
      setActiveTask(details.task);
      setActiveWorkflow(details.workflow);
      setActiveMessages(details.messages);
      setActiveApprovals(details.approvals);
    } catch (err: any) {
      console.warn(`Error loading task ${taskId} details:`, err);
      setActiveTask((prev) => (prev?.id === taskId ? null : prev));
      setActiveWorkflow((prev) => (prev?.taskId === taskId ? null : prev));
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    try {
      setError(null);
      const [
        healthRes,
        agentsRes,
        tasksRes,
        approvalsRes,
        memoriesRes,
        auditRes,
        toolsRes
      ] = await Promise.all([
        api.getHealth(),
        api.getAgents(),
        api.getTasks(),
        api.getApprovals(),
        api.getMemory(),
        api.getAudit(150),
        api.getTools()
      ]);

      setHealth(healthRes);
      setAgents(agentsRes);
      setTasks(tasksRes);
      setPendingApprovals(approvalsRes.filter((a) => a.status === 'PENDING'));
      setMemories(memoriesRes);
      setAuditLogs(auditRes);
      setTools(toolsRes);

      // Select active task or most recent task if activeTask no longer exists
      if (tasksRes.length > 0) {
        const validTask = activeTask ? tasksRes.find((t) => t.id === activeTask.id) : null;
        const targetTask = validTask || tasksRes[0];
        await loadTaskDetails(targetTask.id);
      } else {
        setActiveTask(null);
        setActiveWorkflow(null);
        setActiveMessages([]);
        setActiveApprovals([]);
      }
    } catch (err: any) {
      console.error('Error refreshing NEXUS state:', err);
      setError(err.message || 'Failed to connect to NEXUS server');
    } finally {
      setIsLoading(false);
    }
  }, [activeTask, loadTaskDetails]);

  // Initial load
  useEffect(() => {
    refreshAllData();
  }, []);

  // Set up SSE listener for live updates
  useEffect(() => {
    sseClient.connect();

    const unsubStatus = sseClient.subscribeStatus((connected) => {
      setIsSseConnected(connected);
    });

    const unsubscribe = sseClient.subscribe((evt: NexusTaskEvent) => {
      setLiveEvents((prev) => [evt, ...prev.slice(0, 99)]);

      // Refresh task details if event is related to active task
      if (activeTask && evt.taskId === activeTask.id) {
        loadTaskDetails(activeTask.id);
      }

      // Refresh global agents/tasks/approvals/audit data on major milestones
      if ([
        'task.created',
        'task.started',
        'approval.requested',
        'approval.approved',
        'approval.rejected',
        'action.executed',
        'verification.completed',
        'report.generated',
        'task.completed',
        'task.failed'
      ].includes(evt.eventType)) {
        refreshAllData();
      }
    });

    return () => {
      unsubStatus();
      unsubscribe();
      sseClient.disconnect();
    };
  }, [activeTask, loadTaskDetails, refreshAllData]);

  // Periodic polling safety net every 3 seconds
  useEffect(() => {
    const activeTaskId = activeTask?.id;
    const activeTaskStatus = activeTask?.status;

    if (!activeTaskId || (activeTaskStatus !== 'RUNNING' && activeTaskStatus !== 'AWAITING_APPROVAL')) {
      return;
    }

    const interval = setInterval(() => {
      loadTaskDetails(activeTaskId);
      api.getApprovals().then((apps) => {
        setPendingApprovals(apps.filter((a) => a.status === 'PENDING'));
      }).catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTask?.id, activeTask?.status, loadTaskDetails]);

  const selectTask = async (taskId: string) => {
    setIsLoading(true);
    await loadTaskDetails(taskId);
    setIsLoading(false);
  };

  const triggerScenario = async () => {
    setIsTriggering(true);
    setError(null);
    setDemoNotification(null);
    try {
      const res = await api.triggerDemo();
      await refreshAllData();
      if (res.taskId) {
        await loadTaskDetails(res.taskId);
      }
      setDemoNotification({
        title: 'NEXUS INCIDENT DETECTED',
        subtitle: 'Revenue Operations Pipeline Ingestion Stall',
        traceId: res.traceId || 'nxs-7f3a2b1c'
      });
      setActiveRoute('mission');
    } catch (err: any) {
      console.error('Error triggering scenario:', err);
      setError(`Failed to trigger scenario: ${err.message}`);
    } finally {
      setIsTriggering(false);
    }
  };

  const resetScenario = async () => {
    setIsResetting(true);
    setError(null);
    setDemoNotification(null);
    try {
      await api.resetDemo();
      setActiveTask(null);
      setActiveWorkflow(null);
      setActiveMessages([]);
      setActiveApprovals([]);
      setLiveEvents([]);
      await refreshAllData();
      setActiveRoute('mission');
    } catch (err: any) {
      console.error('Error resetting scenario:', err);
      setError(`Failed to reset scenario: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const approveAction = async (approvalId: string, decidedBy = 'Human Operator') => {
    try {
      await api.approveRequest(approvalId, decidedBy);
      await refreshAllData();
      if (activeTask) {
        await loadTaskDetails(activeTask.id);
      }
    } catch (err: any) {
      console.error(`Error approving ${approvalId}:`, err);
      setError(`Approval failed: ${err.message}`);
    }
  };

  const rejectAction = async (approvalId: string, reason: string, decidedBy = 'Human Operator') => {
    try {
      await api.rejectRequest(approvalId, reason, decidedBy);
      await refreshAllData();
      if (activeTask) {
        await loadTaskDetails(activeTask.id);
      }
    } catch (err: any) {
      console.error(`Error rejecting ${approvalId}:`, err);
      setError(`Rejection failed: ${err.message}`);
    }
  };

  return (
    <NexusContext.Provider
      value={{
        agents,
        tasks,
        activeTask,
        activeWorkflow,
        activeMessages,
        activeApprovals,
        pendingApprovals,
        memories,
        auditLogs,
        tools,
        health,
        liveEvents,
        activeRoute,
        selectedNodeId,
        selectedTraceId,
        isTriggering,
        isResetting,
        isLoading,
        isSseConnected,
        demoNotification,
        error,

        setActiveRoute,
        setSelectedNodeId,
        setSelectedTraceId,
        openTraceExplorer,
        dismissNotification,
        reconnectSse,
        selectTask,
        triggerScenario,
        resetScenario,
        approveAction,
        rejectAction,
        refreshAllData
      }}
    >
      {children}
    </NexusContext.Provider>
  );
};

export const useNexus = () => {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error('useNexus must be used within a NexusProvider');
  }
  return context;
};
