import { Type } from '@sinclair/typebox';
import { AgentTool } from '@earendil-works/pi-agent-core';
import { listAllModels } from '../llm/resolve';
import { getKeyStatuses, setKey, removeKey } from '../llm/keys';
import { getProvider } from '../llm/providers';
import { saveLastSession } from '../llm/session-state';
import { checkOllamaRunning, listOllamaModels } from '../llm/ollama';
import { countMessagesTokens } from '../utils/tokens';

function tool(t: any): any { return t; }

export const slashCommands: Record<string, AgentTool> = {
  effort: tool({
    name: '/effort', label: 'effort',
    description: 'Change thinking level: off, minimal, low, medium, high, xhigh',
    parameters: Type.Object({ level: Type.Union([Type.Literal('off'), Type.Literal('minimal'), Type.Literal('low'), Type.Literal('medium'), Type.Literal('high'), Type.Literal('xhigh')]) }),
    execute: async (_id, params, _signal, _onUpdate, ctx) => {
      try { ctx.config.effort = params.level; return { content: [{ type: 'text', text: `Effort set to ${params.level}` }], details: {} }; }
      catch (e: any) { return { content: [{ type: 'text', text: `Error: ${e.message}` }], details: { isError: true } }; }
    },
  }),
  model: tool({
    name: '/model', label: 'model',
    description: 'Switch model: /model <provider/model> (reinitializes agent)',
    parameters: Type.Object({ target: Type.String({ description: 'provider/model format' }) }),
    execute: async (_id, params, _signal, _onUpdate, ctx) => {
      try { ctx.config.model = params.target; return { content: [{ type: 'text', text: `Model set to ${params.target}. Restart to apply.` }], details: {} }; }
      catch (e: any) { return { content: [{ type: 'text', text: `Error: ${e.message}` }], details: { isError: true } }; }
    },
  }),
  keys: tool({
    name: '/keys', label: 'keys',
    description: 'Manage API keys: /keys list | /keys set <provider> <key> | /keys remove <provider>',
    parameters: Type.Object({
      action: Type.Union([Type.Literal('list'), Type.Literal('set'), Type.Literal('remove')]),
      provider: Type.Optional(Type.String()), key: Type.Optional(Type.String()),
    }),
    execute: async (_id, params, _signal, _onUpdate, ctx) => {
      try {
        switch (params.action) {
          case 'list': {
            const statuses = getKeyStatuses();
            const lines = statuses.map(s => `  ${s.hasKey ? '✓' : '✗'} ${s.name} (${s.provider})`);
            return { content: [{ type: 'text', text: `API Keys:\n${lines.join('\n')}` }], details: { statuses } };
          }
          case 'set': {
            if (!params.provider || !params.key) return { content: [{ type: 'text', text: 'Usage: /keys set <provider> <api-key>' }], details: {} };
            const provider = getProvider(params.provider);
            if (!provider) return { content: [{ type: 'text', text: `Unknown provider: ${params.provider}\nValid: ${getKeyStatuses().map(s => s.provider).join(', ')}` }], details: {} };
            setKey(params.provider, params.key);
            const defaultModel = provider.models[0]?.id;
            if (defaultModel) saveLastSession(provider.id, defaultModel);
            return { content: [{ type: 'text', text: `Key set for ${provider.name} (${params.provider}).${defaultModel ? ` Default: ${provider.id}/${defaultModel}` : ''}` }], details: {} };
          }
          case 'remove': {
            if (!params.provider) return { content: [{ type: 'text', text: 'Usage: /keys remove <provider>' }], details: {} };
            const provider = getProvider(params.provider);
            if (!provider) return { content: [{ type: 'text', text: `Unknown provider: ${params.provider}` }], details: {} };
            removeKey(params.provider);
            return { content: [{ type: 'text', text: `Key removed for ${provider.name}` }], details: {} };
          }
        }
      } catch (e: any) { return { content: [{ type: 'text', text: `Error: ${e.message}` }], details: { isError: true } }; }
    },
  }),
  providers: tool({
    name: '/providers', label: 'providers', description: 'List all providers with key status',
    parameters: Type.Object({}),
    execute: async (_id, _params, _signal, _onUpdate, ctx) => {
      try {
        const statuses = getKeyStatuses();
        const lines = statuses.map(s => {
          const mark = s.hasKey ? '✓' : '✗';
          return `  ${mark} ${s.provider.padEnd(12)} ${s.name}`;
        });
        return { content: [{ type: 'text', text: `Providers (✓=key set, ✗=no key):\n${lines.join('\n')}` }], details: { providers: statuses.map(s => s.provider) } };
      } catch (e: any) { return { content: [{ type: 'text', text: `Error: ${e.message}` }], details: { isError: true } }; }
    },
  }),
  models: tool({
    name: '/models', label: 'models', description: 'List all available models across providers',
    parameters: Type.Object({}),
    execute: async (_id, _params, _signal, _onUpdate, ctx) => {
      try {
        const models = await listAllModels();
        const lines = models.map(m => `  ${m.providerId.padEnd(12)} ${m.id.padEnd(40)} ctx:${(m.contextWindow / 1000).toFixed(0)}k`);
        return { content: [{ type: 'text', text: `Models:\n${lines.join('\n')}` }], details: { models } };
      } catch (e: any) { return { content: [{ type: 'text', text: `Error: ${e.message}` }], details: { isError: true } }; }
    },
  }),
  ollama: tool({
    name: '/ollama', label: 'ollama', description: 'Check Ollama status and list local models',
    parameters: Type.Object({}),
    execute: async (_id, _params, _signal, _onUpdate, ctx) => {
      try {
        const running = await checkOllamaRunning();
        if (!running) return { content: [{ type: 'text', text: 'Ollama not running. Start: ollama serve' }], details: {} };
        const models = await listOllamaModels();
        if (models.length === 0) return { content: [{ type: 'text', text: 'No models. Pull: ollama pull <model>' }], details: {} };
        const lines = models.map(m => `  ${m.name.padEnd(40)} ${m.parameter_size.padEnd(10)} ${m.quantization}`);
        return { content: [{ type: 'text', text: `Ollama models:\n${lines.join('\n')}` }], details: { models } };
      } catch (e: any) { return { content: [{ type: 'text', text: `Error: ${e.message}` }], details: { isError: true } }; }
    },
  }),
  fork: tool({
    name: '/fork', label: 'fork', description: 'Branch session to try alternative approach',
    parameters: Type.Object({}),
    execute: async (_id, _params, _signal, _onUpdate, ctx) => {
      try {
        const fork = ctx.sessionManager.fork(ctx.session);
        return { content: [{ type: 'text', text: `Forked to session ${fork.id}` }], details: { forkId: fork.id } };
      } catch (e: any) { return { content: [{ type: 'text', text: `Error: ${e.message}` }], details: { isError: true } }; }
    },
  }),
  tree: tool({
    name: '/tree', label: 'tree', description: 'Show session tree (all branches)',
    parameters: Type.Object({}),
    execute: async (_id, _params, _signal, _onUpdate, ctx) => {
      try {
        const tree = ctx.sessionManager.getTree(ctx.session.id);
        return { content: [{ type: 'text', text: JSON.stringify(tree, null, 2) }], details: { tree } };
      } catch (e: any) { return { content: [{ type: 'text', text: `Error: ${e.message}` }], details: { isError: true } }; }
    },
  }),
  cost: tool({
    name: '/cost', label: 'cost', description: 'Show token/cost usage',
    parameters: Type.Object({}),
    execute: async (_id, _params, _signal, _onUpdate, ctx) => {
      try {
        const usage = ctx.agent.state.usage || { input: 0, output: 0 };
        let realTokens = 0;
        try {
          const msgs = ctx.agent.state.messages;
          if (Array.isArray(msgs)) realTokens = countMessagesTokens(msgs);
        } catch {};
        const modelId = ctx.config.model.split('/')[1] || '';
        let estCost = 'N/A';
        try {
          const provider = getProvider(ctx.config.model.split('/')[0]);
          if (provider) {
          const model = provider.models.find((m: any) => m.id === modelId);
          if ((model as any)?.cost) {
            const c = (model as any).cost;
            estCost = `$${((realTokens * (c.input + c.output) / 2000) / 1000).toFixed(4)}`;
            }
          }
        } catch {}
        return { content: [{ type: 'text', text: `API usage: ${usage.input} in / ${usage.output} out\nSession tokens: ${realTokens.toLocaleString()}\nEst. cost: ${estCost}` }], details: { usage } };
      } catch (e: any) { return { content: [{ type: 'text', text: `Error: ${e.message}` }], details: { isError: true } }; }
    },
  }),
  compact: tool({
    name: '/compact', label: 'compact', description: 'Force context compaction',
    parameters: Type.Object({}),
    execute: async (_id, _params, _signal, _onUpdate, ctx) => {
      try { await ctx.agent.compact(); return { content: [{ type: 'text', text: 'Context compacted' }], details: {} }; }
      catch (e: any) { return { content: [{ type: 'text', text: `Error: ${e.message}` }], details: { isError: true } }; }
    },
  }),
  status: tool({
    name: '/status', label: 'status', description: 'Show active model, tools, connections, tokens',
    parameters: Type.Object({}),
    execute: async (_id, _params, _signal, _onUpdate, ctx) => {
      try {
        const tools = ctx.agent.state.tools.map((t: any) => t.name).join(', ');
        return { content: [{ type: 'text', text: `Model: ${ctx.config.model}\nEffort: ${ctx.config.effort}\nTools: ${tools}` }], details: { tools } };
      } catch (e: any) { return { content: [{ type: 'text', text: `Error: ${e.message}` }], details: { isError: true } }; }
    },
  }),
};