/**
 * NEXUS - Orchestrator Agent
 * Decomposes complex operational objectives into workflow steps.
 */

import { BaseAgent, AgentExecutionContext } from './baseAgent';
import { eventBus } from '../eventBus';

export interface PlanStep {
  stepIndex: number;
  agentRole: string;
  agentId: string;
  action: string;
  description: string;
}

export class OrchestratorAgent extends BaseAgent {
  constructor() {
    super('orchestrator-agent', 'orchestrator');
  }

  async execute(context: AgentExecutionContext): Promise<Record<string, any>> {
    const agentData = await this.getAgentData();
    await this.updateAgentStatus('busy', context.taskId);

    eventBus.publish({
      taskId: context.taskId,
      traceId: context.traceId,
      eventType: 'agent.started',
      agentId: this.id,
      actor: agentData.name,
      payload: { role: this.role, objective: context.objective }
    });

    const systemPrompt = `You are the NEXUS Orchestrator Agent. Decompose user objectives into a sequential multi-agent workflow plan. Return JSON format with steps array.`;
    const userPrompt = `Objective: ${context.objective}. Generate workflow plan steps for Diagnostic, Research, Security, Operations, and Reporting agents.`;

    const fallbackPlan: { steps: PlanStep[] } = {
      steps: [
        {
          stepIndex: 1,
          agentRole: 'diagnostic',
          agentId: 'diagnostic-agent',
          action: 'investigate_incident',
          description: 'Query telemetry and determine incident root cause.'
        },
        {
          stepIndex: 2,
          agentRole: 'research',
          agentId: 'research-agent',
          action: 'retrieve_history',
          description: 'Search memory bank for past incident post-mortems.'
        },
        {
          stepIndex: 3,
          agentRole: 'security',
          agentId: 'security-agent',
          action: 'evaluate_policy',
          description: 'Evaluate remediation risk against security policies.'
        },
        {
          stepIndex: 4,
          agentRole: 'operations',
          agentId: 'operations-agent',
          action: 'execute_remediation',
          description: 'Execute authorized pipeline restart tool.'
        },
        {
          stepIndex: 5,
          agentRole: 'reporting',
          agentId: 'reporting-agent',
          action: 'compile_report',
          description: 'Synthesize audit post-mortem report.'
        }
      ]
    };

    const rawPlan = await this.generateStructuredJson<any>(
      systemPrompt,
      userPrompt,
      fallbackPlan
    );

    const steps: PlanStep[] = Array.isArray(rawPlan?.steps)
      ? rawPlan.steps
      : (Array.isArray(rawPlan) ? rawPlan : fallbackPlan.steps);

    this.emitFinding(
      context,
      `Decomposed objective into ${steps.length}-step multi-agent execution plan.`,
      { steps }
    );

    await this.updateAgentStatus('idle');
    return { plan: steps };
  }
}

export const orchestratorAgent = new OrchestratorAgent();
