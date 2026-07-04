import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';
import type { AgentMessage } from '@earendil-works/pi-agent-core';
import { logger } from '../utils/logger';
import { encrypt, tryDecrypt } from '../utils/encrypt';

export interface SessionData {
  id: string;
  name?: string;
  parentId?: string;
  children: string[];
  messages: AgentMessage[];
  createdAt: number;
  updatedAt: number;
  cwd: string;
}

function generateSessionId(prefix: string = 'session'): string {
  return `${prefix}-${Date.now()}-${randomBytes(8).toString('hex')}`;
}

export class SessionManager {
  private dir: string;

  constructor(dir: string) {
    this.dir = dir;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
  }

  create(cwd: string = process.cwd()): SessionData {
    const id = generateSessionId('session');
    const session: SessionData = {
      id,
      messages: [],
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cwd,
    };
    this.save(session);
    return session;
  }

  fork(parent: SessionData | string): SessionData {
    const parentSession = typeof parent === 'string' ? this.load(parent) : parent;
    if (!parentSession) throw new Error(`Parent session not found: ${parent}`);
    const fork: SessionData = {
      id: generateSessionId('fork'),
      parentId: parentSession.id,
      messages: JSON.parse(JSON.stringify(parentSession.messages)),
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cwd: parentSession.cwd,
    };
    parentSession.children.push(fork.id);
    this.save(parentSession);
    this.save(fork);
    return fork;
  }

  getTree(rootId: string): any {
    const sessions = this.list();
    const map: Map<string, any> = new Map(sessions.map(s => [s.id, { ...s, children: [] as any[] }]));
    for (const s of sessions) {
      if (s.parentId && map.has(s.parentId)) {
        map.get(s.parentId)!.children.push(map.get(s.id)!);
      }
    }
    return map.get(rootId);
  }

  list(): SessionData[] {
    if (!fs.existsSync(this.dir)) return [];
    return fs.readdirSync(this.dir)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => { try { return JSON.parse(tryDecrypt(fs.readFileSync(path.join(this.dir, f), 'utf8'))); } catch { return null; } })
      .filter((s): s is SessionData => s !== null)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  save(session: SessionData): void {
    session.updatedAt = Date.now();
    const file = path.join(this.dir, `${session.id}.jsonl`);
    const tmpFile = file + '.tmp';
    fs.writeFileSync(tmpFile, encrypt(JSON.stringify(session, null, 2)), { mode: 0o600 });
    fs.renameSync(tmpFile, file);
  }

  load(id: string): SessionData | null {
    const file = path.join(this.dir, `${id}.jsonl`);
    if (!fs.existsSync(file)) return null;
    try { return JSON.parse(tryDecrypt(fs.readFileSync(file, 'utf8'))); } catch { return null; }
  }

  getLatest(): SessionData | null {
    const list = this.list();
    return list[0] || null;
  }

  prune(maxSessions: number = 100): void {
    const sessions = this.list();
    if (sessions.length <= maxSessions) return;
    const toDelete = sessions.slice(maxSessions);
    for (const s of toDelete) {
      const file = path.join(this.dir, `${s.id}.jsonl`);
      try { fs.unlinkSync(file); } catch {}
    }
  }
}