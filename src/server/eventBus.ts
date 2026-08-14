/**
 * NEXUS - Server-Side Event Bus
 * Lightweight event emitter for task state changes, telemetry, and SSE streaming.
 */

import { EventEmitter } from 'events';
import { AuditEvent, AuditEventType } from '../types/nexus';

export interface NexusTaskEvent {
  id: string;
  taskId: string;
  traceId: string;
  eventType: AuditEventType;
  agentId?: string;
  actor: string;
  timestamp: string;
  payload: Record<string, any>;
}

type EventListener = (event: NexusTaskEvent) => void;

class NexusEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(100);
  }

  publish(event: Omit<NexusTaskEvent, 'id' | 'timestamp'>): NexusTaskEvent {
    const fullEvent: NexusTaskEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };

    // Emit globally and for specific taskId
    this.emitter.emit('nexus-event', fullEvent);
    this.emitter.emit(`task-event:${event.taskId}`, fullEvent);
    return fullEvent;
  }

  subscribeGlobal(listener: EventListener): () => void {
    this.emitter.on('nexus-event', listener);
    return () => this.emitter.off('nexus-event', listener);
  }

  subscribeTask(taskId: string, listener: EventListener): () => void {
    const channel = `task-event:${taskId}`;
    this.emitter.on(channel, listener);
    return () => this.emitter.off(channel, listener);
  }
}

export const eventBus = new NexusEventBus();
