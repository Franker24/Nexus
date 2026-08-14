/**
 * NEXUS - Express Backend Server Entrypoint
 * Binds to 0.0.0.0:3000. Provides REST APIs, SSE event streams, Vite dev server middleware, and static production serving.
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { memoryContainer } from './src/repositories/memoryStore';
import { pipelineSimulation } from './src/server/simulation';
import { eventBus, NexusTaskEvent } from './src/server/eventBus';
import { orchestrator } from './src/server/orchestrator';
import { approvalService } from './src/server/approvalService';
import { auditService } from './src/server/auditService';
import { memoryService } from './src/server/memoryService';

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

// --- API ROUTES ---

// 1. Health check
app.get('/api/health', async (req, res) => {
  const agents = await memoryContainer.agents.getAll();
  const tasks = await memoryContainer.tasks.getAll();
  const pendingApprovals = await approvalService.getPending();
  const memories = await memoryService.getAllMemories();
  const auditLogs = await auditService.getAllAuditLogs(500);

  res.json({
    status: 'healthy',
    activeAgentsCount: agents.filter((a) => a.status === 'busy').length,
    runningTasksCount: tasks.filter((t) => t.status === 'RUNNING' || t.status === 'AWAITING_APPROVAL').length,
    pendingApprovalsCount: pendingApprovals.length,
    totalMemoriesCount: memories.length,
    totalAuditEventsCount: auditLogs.length,
    uptimeSeconds: process.uptime()
  });
});

// 2. Agents
app.get('/api/agents', async (req, res) => {
  const agents = await memoryContainer.agents.getAll();
  res.json(agents);
});

app.get('/api/agents/:id', async (req, res) => {
  const agent = await memoryContainer.agents.getById(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: `Agent '${req.params.id}' not found` });
  }
  res.json(agent);
});

// 3. Tasks
app.get('/api/tasks', async (req, res) => {
  const tasks = await memoryContainer.tasks.getAll();
  res.json(tasks);
});

app.get('/api/tasks/:id', async (req, res) => {
  const task = await memoryContainer.tasks.getById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: `Task '${req.params.id}' not found` });
  }
  const workflow = await memoryContainer.workflows.getByTaskId(req.params.id);
  const messages = await memoryContainer.messages.getByTaskId(req.params.id);
  const approvals = await approvalService.getByTaskId(req.params.id);

  res.json({
    task,
    workflow,
    messages,
    approvals
  });
});

app.post('/api/tasks', async (req, res) => {
  const { title, objective, priority } = req.body;
  if (!title || !objective) {
    return res.status(400).json({ error: 'title and objective are required' });
  }

  const task = await orchestrator.createRevenueIncidentTask();
  res.status(201).json(task);
});

app.post('/api/tasks/:id/start', async (req, res) => {
  try {
    const task = await orchestrator.runWorkflow(req.params.id);
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. SSE Real-time Events Stream
app.get('/api/tasks/:id/events', (req, res) => {
  const taskId = req.params.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const listener = (evt: NexusTaskEvent) => {
    res.write(`event: ${evt.eventType}\n`);
    res.write(`data: ${JSON.stringify(evt)}\n\n`);
  };

  const unsubscribe = eventBus.subscribeTask(taskId, listener);

  req.on('close', () => {
    unsubscribe();
  });
});

// Global SSE Stream for Mission Control Live Activity
app.get('/api/events/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const listener = (evt: NexusTaskEvent) => {
    res.write(`event: ${evt.eventType}\n`);
    res.write(`data: ${JSON.stringify(evt)}\n\n`);
  };

  const unsubscribe = eventBus.subscribeGlobal(listener);

  req.on('close', () => {
    unsubscribe();
  });
});

// 5. Approvals
app.get('/api/approvals', async (req, res) => {
  const approvals = await approvalService.getAll();
  res.json(approvals);
});

app.post('/api/approvals/:id/approve', async (req, res) => {
  try {
    const { decidedBy } = req.body;
    const { approval, taskId } = await approvalService.approveRequest(
      req.params.id,
      decidedBy || 'Human Operator'
    );

    // Resume task execution asynchronously
    orchestrator.resumeWorkflow(taskId, approval.id).catch((err) => {
      console.error(`Error resuming task ${taskId} post-approval:`, err);
    });

    res.json({
      message: 'Approval granted. Workflow resumed.',
      approval,
      taskId
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/approvals/:id/reject', async (req, res) => {
  try {
    const { reason, decidedBy } = req.body;
    const { approval, taskId } = await approvalService.rejectRequest(
      req.params.id,
      reason || 'Action denied by Human Operator',
      decidedBy || 'Human Operator'
    );

    await orchestrator.handleRejection(taskId, reason || 'Action denied by Human Operator');

    res.json({
      message: 'Approval rejected. Workflow canceled.',
      approval,
      taskId
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Tools, Memory & Audit
app.get('/api/tools', async (req, res) => {
  const tools = await memoryContainer.tools.getAll();
  res.json(tools);
});

app.get('/api/memory', async (req, res) => {
  const query = req.query.q as string;
  if (query) {
    const results = await memoryService.searchMemory(query);
    return res.json(results);
  }
  const memories = await memoryService.getAllMemories();
  res.json(memories);
});

app.get('/api/audit', async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
  const logs = await auditService.getAllAuditLogs(limit);
  res.json(logs);
});

// 7. Demo Scenario Controls
app.post('/api/demo/trigger', async (req, res) => {
  try {
    const task = await orchestrator.createRevenueIncidentTask();

    // Trigger workflow execution asynchronously
    orchestrator.runWorkflow(task.id).catch((err) => {
      console.error(`Error executing workflow for task ${task.id}:`, err);
    });

    res.status(202).json({
      message: 'Revenue Operations Incident scenario triggered.',
      taskId: task.id,
      traceId: task.traceId,
      status: 'CREATED'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/demo/reset', async (req, res) => {
  try {
    pipelineSimulation.reset();
    await memoryContainer.resetToDefaultScenario();
    res.json({ message: 'NEXUS demo environment successfully reset to initial deterministic state.' });
  } catch (err: any) {
    console.error('[RESET SCENARIO ERROR]', err);
    res.status(500).json({ error: `${err.message} | Stack: ${err.stack || 'No stack trace available'}` });
  }
});

// --- VITE DEV / PRODUCTION STATIC SERVING ---
const isVercel = !!(process.env.VERCEL || process.env.NOW_REGION || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (process.env.NODE_ENV !== 'production' && !isVercel) {
  createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  }).then((vite) => {
    app.use(vite.middlewares);
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (!isVercel) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NEXUS Server] Running on http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;
