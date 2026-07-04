import type { AgentMessage } from '@earendil-works/pi-agent-core';
import { countMessagesTokens } from '../utils/tokens';

function getMessageText(m: AgentMessage): string {
  const msg = m as any;
  if (typeof msg.content === 'string') return msg.content;
  if (Array.isArray(msg.content)) {
    return msg.content.filter((c: any) => c?.type === 'text').map((c: any) => c.text).join('\n');
  }
  if (msg.text) return msg.text;
  if (msg.summary) return msg.summary;
  return '';
}

export async function compactStrategy(
  messages: AgentMessage[],
  threshold: number,
  summarize?: (texts: string[]) => Promise<string>
): Promise<AgentMessage[]> {
  const tokens = countMessagesTokens(messages);
  if (tokens < threshold) return messages;

  const KEEP_RAW = 20;
  const keepFresh = messages.slice(-KEEP_RAW);
  if (messages.length <= KEEP_RAW) return messages;

  const oldMessages = messages.slice(0, -KEEP_RAW);

  let summaryText: string;
  if (summarize) {
    const oldTexts = oldMessages.map(getMessageText).filter(Boolean);
    summaryText = await summarize(oldTexts);
  } else {
    summaryText = buildHeuristicSummary(oldMessages);
  }

  const summary: AgentMessage = {
    role: 'user',
    content: summaryText,
    timestamp: Date.now(),
  } as AgentMessage;

  return [summary, ...keepFresh];
}

function buildHeuristicSummary(oldMessages: AgentMessage[]): string {
  const userPrompts = oldMessages
    .filter(m => m.role === 'user')
    .map(getMessageText)
    .filter(Boolean);
  const allTexts = oldMessages.map(getMessageText).filter(Boolean);
  const combined = allTexts.join('\n');
  const fileOps = combined.match(/(Written|Edited|Created|Deleted)\s[^\n]+/g) || [];
  const errors = combined.match(/[Ee]rror[^\n]*/g) || [];
  const keys = combined.match(/(?:set|using|switching to|model|provider|branch)[^\n]{10,60}/gi) || [];

  let summary = `[Context compacted: ${oldMessages.length} messages summarized.`;

  const task = userPrompts[0];
  if (task) {
    summary += `\nOriginal task: ${task.slice(0, 300)}${task.length > 300 ? '...' : ''}`;
  }

  if (fileOps.length > 0) {
    const unique = [...new Set(fileOps)].slice(0, 10);
    summary += `\nFiles modified:\n${unique.map(f => `  - ${f.slice(0, 150)}`).join('\n')}`;
  }

  if (errors.length > 0) {
    const unique = [...new Set(errors)].slice(0, 5);
    summary += `\nErrors:\n${unique.map(e => `  - ${e.slice(0, 150)}`).join('\n')}`;
  }

  if (keys.length > 0) {
    const unique = [...new Set(keys)].slice(0, 5);
    summary += `\nKey actions: ${unique.join('; ').slice(0, 300)}`;
  }

  summary += '\nContinue working.]';
  return summary;
}