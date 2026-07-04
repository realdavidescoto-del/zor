import { Type } from '@sinclair/typebox';
import { AgentTool, AgentToolResult } from '@earendil-works/pi-agent-core';

const BLOCKED_HOSTS = new Set([
  '169.254.169.254', 'metadata.google.internal', '0.0.0.0', '127.0.0.1', 'localhost',
]);

function validateUrl(urlStr: string): URL {
  let parsed: URL;
  try { parsed = new URL(urlStr); } catch { throw new Error(`Invalid URL: "${urlStr}"`); }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(`URL must use http/https, got: ${parsed.protocol}`);
  }
  if (BLOCKED_HOSTS.has(parsed.hostname)) {
    throw new Error(`URL points to blocked host: ${parsed.hostname}`);
  }
  if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.)/.test(parsed.hostname)) {
    throw new Error(`URL points to private network: ${parsed.hostname}`);
  }
  return parsed;
}

export const webFetchTool: AgentTool = {
  name: 'WebFetch',
  label: 'webfetch',
  description: 'Fetch content from a URL. Returns markdown, text, or HTML.',
  parameters: Type.Object({
    url: Type.String({ description: 'URL to fetch' }),
    format: Type.Optional(Type.Union([Type.Literal('markdown'), Type.Literal('text'), Type.Literal('html')], { default: 'markdown' })),
  }),
  execute: async (_id, params): Promise<AgentToolResult<any>> => {
    try {
      const { url, format } = params as Record<string, any>;
      validateUrl(url);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'ZorCode/0.1.0' },
      });
      clearTimeout(timer);
      if (!res.ok) return { content: [{ type: 'text' as const, text: `Fetch failed: HTTP ${res.status}` }], details: {} };
      const contentType = res.headers.get('content-type') || '';
      const isHtml = contentType.includes('text/html') || contentType.includes('application/xhtml');
      const text = await res.text();

      if (format === 'html' || isHtml) {
        const truncated = text.slice(0, 100_000);
        return { content: [{ type: 'text' as const, text: truncated }], details: { contentType } };
      }

      const truncated = text.slice(0, 50_000);
      return { content: [{ type: 'text' as const, text: truncated }], details: { contentType } };
    } catch (e: any) {
      return { content: [{ type: 'text' as const, text: `WebFetch error: ${e.message}` }], details: { isError: true } };
    }
  },
};
