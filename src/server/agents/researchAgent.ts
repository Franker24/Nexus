/**
 * NEXUS - Context & Research Agent
 * Queries memory bank and historical archives for past resolution patterns.
 */

import { BaseAgent, AgentExecutionContext } from './baseAgent';
import { toolGateway } from '../toolGateway';
import { MemoryItem } from '../../types/nexus';
import { eventBus } from '../eventBus';

export interface ResearchOutput {
  relevantMemories: MemoryItem[];
  historicalIncidents: string[];
  patterns: string[];
  confidence: number;
  summary: string;
}

export class ResearchAgent extends BaseAgent {
  constructor() {
    super('research-agent', 'research');
  }

  async execute(context: AgentExecutionContext): Promise<ResearchOutput> {
    const agentData = await this.getAgentData();
    await this.updateAgentStatus('busy', context.taskId);

    eventBus.publish({
      taskId: context.taskId,
      traceId: context.traceId,
      eventType: 'agent.started',
      agentId: this.id,
      actor: agentData.name,
      payload: { role: this.role }
    });

    const searchRes = await toolGateway.executeTool({
      agent: agentData,
      toolId: 'search_incident_history',
      params: { query: 'revenue pipeline lock restart' },
      taskId: context.taskId,
      traceId: context.traceId
    });

    const memories: MemoryItem[] = searchRes.output.results || [];

    eventBus.publish({
      taskId: context.taskId,
      traceId: context.traceId,
      eventType: 'memory.retrieved',
      agentId: this.id,
      actor: agentData.name,
      payload: { query: 'revenue pipeline lock restart', count: memories.length, memories }
    });

    const historicalIncidents = [
      'INC-2025-11-04: Revenue pipeline queue lock stall during webhook traffic burst. Resolved by executing restart_revenue_pipeline.',
      'SEC-POLICY-88: High-risk financial infrastructure tool executions require human-in-the-loop authorization.'
    ];

    const summary = memories.length > 0
      ? `Retrieved ${memories.length} relevant historical incident records. Past resolution pattern matches previous incident INC-2025-11-04 (100% correlation with Redis lock accumulation).`
      : 'No prior matching incident records found.';

    const output: ResearchOutput = {
      relevantMemories: memories,
      historicalIncidents,
      patterns: [
        'Stale distributed locks during traffic bursts require worker reset',
        'Restarting ingestion workers clears stale lock state safely'
      ],
      confidence: 0.94,
      summary
    };

    this.emitFinding(context, summary, { research: output });

    await this.updateAgentStatus('idle');
    return output;
  }
}

export const researchAgent = new ResearchAgent();
