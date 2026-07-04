import { AgentTool, AgentToolResult } from '@earendil-works/pi-agent-core';
import { Type } from '@sinclair/typebox';
import { getAvailableProviders } from '../../llm/providers';

export function ToolSearch(mcpClient: any): AgentTool {
  const providers = getAvailableProviders();

  return {
    name: 'search',
    label: 'search',
    description: `Search for information across the web. Available providers: ${providers.map(p => p.id).join(', ')}.`,
    parameters: Type.Object({
      query: Type.String({ description: 'Search query' }),
      provider: Type.Optional(Type.String({ description: 'Search provider (web)' })),
      maxResults: Type.Optional(Type.Number({ description: 'Max results to return', default: 10 })),
    }),
    execute: async (_id, params): Promise<AgentToolResult<any>> => {
      const { query, maxResults } = params as Record<string, any>;
      const limit = maxResults || 10;
      try {
        const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`, {
          headers: { 'Accept': 'application/json', 'X-Subscription-Token': process.env.BRAVE_API_KEY || '' },
        });
        if (!res.ok) return { content: [{ type: 'text', text: `Search failed: ${res.status}` }], details: {} };
        const data: any = await res.json();
        const results = (data.web?.results || []).slice(0, maxResults).map((r: any) => `${r.title}: ${r.url}\n${r.description}`).join('\n\n');
        return { content: [{ type: 'text', text: results || 'No results' }], details: {} };
      } catch (e: any) {
        return { content: [{ type: 'text', text: `Search error: ${e.message}` }], details: {} };
      }
    },
  };
}