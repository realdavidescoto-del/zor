let _encoding: any = null;
let _encoderName: string | null = null;

function getEncoding() {
  const model = 'gpt-4';
  if (_encoding && _encoderName === model) return _encoding;
  if (_encoding) { _encoding.free(); }
  const { encoding_for_model } = require('tiktoken');
  _encoding = encoding_for_model(model);
  _encoderName = model;
  return _encoding;
}

export function countTokens(text: string): number {
  try {
    const enc = getEncoding();
    return enc.encode(text).length;
  } catch {
    return Math.round(text.length / 4);
  }
}

export function countMessagesTokens(messages: Array<{ role?: string; content?: any; text?: string; summary?: string }>): number {
  let total = 0;
  for (const m of messages) {
    const text = extractText(m);
    if (text) total += countTokens(text);
  }
  return Math.round(total * 1.15);
}

function extractText(m: any): string {
  if (typeof m.content === 'string') return m.content;
  if (Array.isArray(m.content)) {
    return m.content.filter((c: any) => c?.type === 'text').map((c: any) => c.text).join('\n');
  }
  if (m.text) return m.text;
  if (m.summary) return m.summary;
  return '';
}
