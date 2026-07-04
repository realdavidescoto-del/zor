import { Type } from '@sinclair/typebox';
import { Agent, AgentTool } from '@earendil-works/pi-agent-core';
import { getModel } from '@earendil-works/pi-ai';
import { resolveModel } from '../llm/resolve';
import type { ZorConfig } from '../config';
import { coreTools, getReadOnlyTools } from './tools';

const SUBAGENT_PRESETS: Record<string, { name: string; systemPrompt: string; tools: AgentTool[] }> = {
  explorer: {
    name: 'explorer',
    systemPrompt: 'You are an exploration agent. Read files, search code, gather information. Do not modify files. Report findings concisely.',
    tools: getReadOnlyTools(),
  },
  reviewer: {
    name: 'reviewer',
    systemPrompt: 'You are a code reviewer. Analyze code quality, security issues, and bugs. Provide specific, actionable feedback. Do not modify files.',
    tools: getReadOnlyTools(),
  },
  debugger: {
    name: 'debugger',
    systemPrompt: 'You are a debugging specialist. Read error logs, trace code paths, identify root causes. Report findings with file paths and line numbers.',
    tools: getReadOnlyTools(),
  },
  builder: {
    name: 'builder',
    systemPrompt: 'You are a builder. Create files, write code, run tests. Be precise and follow conventions.',
    tools: [...coreTools],
  },
};

export async function createSubAgent(
  parentConfig: ZorConfig,
  name: string,
  task: string
) {
  const preset = SUBAGENT_PRESETS[name] || SUBAGENT_PRESETS.explorer;
  const resolved = await resolveModel(parentConfig);
  const model = getModel(resolved.provider.id as any, resolved.model.id as any);

  const subAgent = new Agent({
    initialState: {
      systemPrompt: preset.systemPrompt + `\n\nTask: ${task}`,
      model,
      thinkingLevel: parentConfig.effort === 'xhigh' ? 'xhigh' : parentConfig.effort as any,
      tools: preset.tools,
      messages: [],
    },
    toolExecution: 'parallel',
  });

  return subAgent;
}

export const taskTool: AgentTool = {
  name: 'Task',
  label: 'task',
  description: 'Spawn an isolated sub-agent for exploration, review, or parallel work. Sub-agents have their own context window and return only a summary.',
  parameters: Type.Object({
    name: Type.Optional(Type.String({ description: 'Sub-agent type: explorer, reviewer, debugger, builder' })),
    task: Type.String({ description: 'Task description for the sub-agent' }),
  }),
  execute: async (_id: any, params: any, _signal: any, _onUpdate: any, ctx: any) => {
    if (!ctx?.config) {
      return { content: [{ type: 'text' as const, text: 'Error: config not available' }], details: {} };
    }
    const subAgent = await createSubAgent(ctx.config, params.name || 'explorer', params.task);
    const result = await subAgent.prompt(params.task);
    const summary = subAgent.state.messages
      .filter((m: any) => m.role === 'assistant')
      .map((m: any) => typeof (m as any).content === 'string' ? (m as any).content : '')
      .join('\n');
    return {
      content: [{ type: 'text' as const, text: summary || 'Sub-agent completed with no output' }],
      details: { subAgentName: params.name, messageCount: subAgent.state.messages.length },
    };
  },
} as any as AgentTool;