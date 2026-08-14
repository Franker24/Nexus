/**
 * NEXUS - Base Agent Abstraction
 * Configured for Google GenAI SDK (@google/genai) using process.env.GEMINI_MODEL.
 * Handles structured generation, retries, and state tracking.
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
import { Agent, AgentRole } from '../../types/nexus';
import { memoryContainer } from '../../repositories/memoryStore';
import { eventBus } from '../eventBus';

export interface AgentExecutionContext {
  taskId: string;
  traceId: string;
  objective: string;
  sharedContext: Record<string, any>;
  approvalId?: string;
}

export abstract class BaseAgent {
  public id: string;
  public role: AgentRole;
  public name: string;
  protected ai: GoogleGenAI | null = null;
  protected modelName: string;

  constructor(agentId: string, role: AgentRole) {
    this.id = agentId;
    this.role = role;
    this.name = agentId;
    const envModel = (process.env.GEMINI_MODEL || '').replace(/['"]/g, '').trim();
    let cleanModel = 'gemini-2.5-flash';
    if (envModel.toLowerCase().includes('gemini')) {
      cleanModel = envModel.replace(/^models\//, '');
    }
    this.modelName = cleanModel;

    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }

  protected async getAgentData(): Promise<Agent> {
    const data = await memoryContainer.agents.getById(this.id);
    if (!data) {
      throw new Error(`Agent record '${this.id}' not found in registry`);
    }
    this.name = data.name;
    return data;
  }

  protected async updateAgentStatus(status: Agent['status'], currentTaskId?: string): Promise<void> {
    await memoryContainer.agents.updateStatus(this.id, status, currentTaskId);
  }

  abstract execute(context: AgentExecutionContext): Promise<Record<string, any>>;

  /**
   * Helper method for generating structured JSON output using Gemini with retries.
   */
  protected async generateStructuredJson<T>(
    systemInstruction: string,
    prompt: string,
    fallback: T,
    maxRetries = 2
  ): Promise<T> {
    if (!this.ai || !process.env.GEMINI_API_KEY) {
      return fallback;
    }

    let attempts = 0;
    while (attempts <= maxRetries) {
      try {
        attempts++;
        const response = await this.ai.models.generateContent({
          model: this.modelName,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return parsed as T;
        }
      } catch (err: any) {
        console.warn(`[Agent:${this.id}] Gemini JSON generation attempt ${attempts} failed:`, err?.message || err);
        if (attempts > maxRetries) break;
      }
    }

    return fallback;
  }

  protected emitFinding(
    context: AgentExecutionContext,
    content: string,
    payload?: Record<string, any>
  ): void {
    eventBus.publish({
      taskId: context.taskId,
      traceId: context.traceId,
      eventType: 'agent.finding_created',
      agentId: this.id,
      actor: this.name,
      payload: { content, ...payload }
    });

    memoryContainer.messages.add({
      taskId: context.taskId,
      traceId: context.traceId,
      fromAgentId: this.id,
      type: 'finding',
      content,
      payload
    });
  }
}
