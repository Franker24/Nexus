/**
 * NEXUS - Audit Service
 * Writes immutable audit trail events to repository for compliance and tracing.
 */

import { memoryContainer } from '../repositories/memoryStore';
import { AuditEvent, AuditEventType, AuditEventStatus } from '../types/nexus';
import { eventBus, NexusTaskEvent } from './eventBus';

export class AuditService {
  constructor() {
    // Automatically record published task events to the audit repository
    eventBus.subscribeGlobal(async (evt: NexusTaskEvent) => {
      await this.recordEvent({
        traceId: evt.traceId,
        taskId: evt.taskId,
        eventType: evt.eventType,
        agentId: evt.agentId,
        actor: evt.actor,
        target: evt.payload?.target || evt.payload?.toolId || evt.payload?.action,
        details: evt.payload,
        status: evt.payload?.error ? 'FAILED' : (evt.payload?.status as AuditEventStatus) || 'INFO'
      });
    });
  }

  async recordEvent(
    data: Omit<AuditEvent, 'id' | 'timestamp'>
  ): Promise<AuditEvent> {
    return memoryContainer.audit.add(data);
  }

  async getAuditByTraceId(traceId: string): Promise<AuditEvent[]> {
    return memoryContainer.audit.getByTraceId(traceId);
  }

  async getAuditByTaskId(taskId: string): Promise<AuditEvent[]> {
    return memoryContainer.audit.getByTaskId(taskId);
  }

  async getAllAuditLogs(limit = 100): Promise<AuditEvent[]> {
    return memoryContainer.audit.getAll(limit);
  }
}

export const auditService = new AuditService();
