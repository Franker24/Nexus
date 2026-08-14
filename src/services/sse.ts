/**
 * NEXUS - Server-Sent Events (SSE) Client Hook
 * Subscribes to real-time events from the backend EventBus stream.
 */

import { NexusTaskEvent } from '../server/eventBus';

export type SSEEventListener = (event: NexusTaskEvent) => void;
export type SSEStatusListener = (connected: boolean) => void;

export class NexusSSEClient {
  private eventSource: EventSource | null = null;
  private listeners: Set<SSEEventListener> = new Set();
  private statusListeners: Set<SSEStatusListener> = new Set();
  private isConnected = false;

  connect(taskId?: string) {
    this.disconnect();

    const url = taskId ? `/api/tasks/${taskId}/events` : '/api/events/stream';
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.isConnected = true;
      this.statusListeners.forEach((l) => l(true));
      console.log(`[SSE Client] Connected to stream: ${url}`);
    };

    this.eventSource.onerror = (err) => {
      this.isConnected = false;
      this.statusListeners.forEach((l) => l(false));
      console.warn(`[SSE Client] Error/disconnected from stream: ${url}`, err);
    };

    // Generic fallback event message handling
    this.eventSource.onmessage = (e) => {
      try {
        const data: NexusTaskEvent = JSON.parse(e.data);
        this.listeners.forEach((listener) => listener(data));
      } catch (err) {
        console.error('[SSE Client] Error parsing SSE message:', err);
      }
    };

    // Custom named events from EventBus
    const eventTypes = [
      'task.created',
      'task.started',
      'agent.started',
      'agent.tool_called',
      'agent.finding_created',
      'memory.retrieved',
      'policy.evaluated',
      'approval.requested',
      'approval.approved',
      'approval.rejected',
      'action.executed',
      'verification.completed',
      'report.generated',
      'task.completed',
      'task.failed'
    ];

    eventTypes.forEach((type) => {
      this.eventSource?.addEventListener(type, (e: MessageEvent) => {
        try {
          const data: NexusTaskEvent = JSON.parse(e.data);
          this.listeners.forEach((listener) => listener(data));
        } catch (err) {
          console.error(`[SSE Client] Error parsing ${type} event:`, err);
        }
      });
    });
  }

  subscribe(listener: SSEEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeStatus(listener: SSEStatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.isConnected);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
    }
  }

  getConnected(): boolean {
    return this.isConnected;
  }
}

export const sseClient = new NexusSSEClient();
