import { Agent } from '@earendil-works/pi-agent-core';
import { getModel } from '@earendil-works/pi-ai';
import type { Model, KnownProvider } from '@earendil-works/pi-ai/base';
import { permissionGate } from '../permissions/gate';
import { requestToolConfirmation } from '../permissions/confirm';
import { compactStrategy } from '../session/compact';
import { assembleSystemPrompt } from './system-prompt';
import { buildToolSet } from './tools';
import { MCPClient } from '../mcp/client';
import { SessionManager, SessionData } from '../session/manager';
import { RateLimiter } from '../utils/rate-limiter';
import { logger } from '../utils/logger';
import { withRetry } from '../utils/retry';
import { CircuitBreaker } from '../utils/circuit-breaker';
import type { ZorConfig } from '../config';
import { resolveModel } from '../llm/resolve';
import { Sandbox } from '../sandbox/sandbox';

function createModel(providerId: string, modelId: string): Model<any> {
  const knownProviders: string[] = ['anthropic', 'openai', 'google', 'deepseek', 'groq', 'mistral', 'xai', 'together', 'fireworks', 'cerebras', 'nvidia', 'minimax', 'openrouter', 'moonshotai', 'huggingface', 'zai', 'cloudflare', 'github-copilot', 'amazon-bedrock', 'azure-openai', 'google-vertex', 'opencode', 'opencode-go'];
  if (knownProviders.includes(providerId)) {
    // @ts-expect-error modelId type is strict in pi-ai
    return getModel(providerId as unknown as KnownProvider, modelId as any) as Model<any>;
  }
  return {
    id: modelId, name: modelId, api: 'openai-completions', provider: providerId,
    baseUrl: `https://api.${providerId}.com/v1`,
    reasoning: false, input: ['text'],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 32768, maxTokens: 4096,
  } as Model<any>;
}

export async function createZorAgent(config: ZorConfig, existingSession?: SessionData) {
  const mcpClient = new MCPClient();
  const sessionManager = new SessionManager(config.session.dir);
  const session = existingSession || sessionManager.create();
  sessionManager.prune(1000);
  const rateLimiter = new RateLimiter({ maxRequests: 60, windowMs: 60_000 });
  const circuitBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 15000 });
  const sandbox = config.sandbox ? new Sandbox() : undefined;
  const mcpErrors: string[] = [];

  for (const serverConfig of config.mcp.servers) {
    try {
      await mcpClient.connect(JSON.parse(serverConfig));
    } catch (e: any) {
      const msg = `MCP server failed: ${e.message}`;
      mcpErrors.push(msg);
      logger.error(msg, { provider: 'mcp', error: e.message });
    }
  }

  const resolved = await resolveModel(config);
  const model = createModel(resolved.provider.id, resolved.model.id);

  const agent = new Agent({
    initialState: {
      systemPrompt: assembleSystemPrompt(config),
      model,
      thinkingLevel: config.effort as any,
      tools: buildToolSet(config, mcpClient, sandbox),
      messages: session.messages || [],
    },

    beforeToolCall: async ({ toolCall, args }) => {
      const result = permissionGate(config.permissions, toolCall, args as Record<string, unknown>);
      if (result.block) return { block: true, reason: result.reason };
      if (result.needsConfirmation) {
        const argsObj = args as Record<string, any>;
        const description = `${toolCall.name} ${argsObj.command || argsObj.filepath || argsObj.files || (argsObj as any).message || ''}`.slice(0, 100);
        const approved = await requestToolConfirmation(toolCall.name, { description, ...argsObj });
        if (!approved) return { block: true, reason: `${toolCall.name} declined by user` };
      }
      return {};
    },

    transformContext: async (messages) => {
      return compactStrategy(messages, config.session.compactThreshold);
    },

    toolExecution: 'parallel',
    getApiKey: async () => resolved.apiKey,
  });

  agent.subscribe((event: any) => {
    if (event.type === 'turn_end' && event.message) {
      try {
        session.messages = agent.state.messages;
        sessionManager.save(session);
      } catch (e: any) {
        logger.error('Failed to save session', { error: e.message });
      }
    }
  });

  return { agent, model, mcpClient, sessionManager, session, resolved, mcpErrors, rateLimiter, circuitBreaker };
}