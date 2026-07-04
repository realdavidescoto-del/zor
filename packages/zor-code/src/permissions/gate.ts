type PermissionMode = 'auto' | 'confirm' | 'plan' | 'deny';

const DESTRUCTIVE_TOOLS = new Set(['bash', 'write', 'edit', 'gitadd', 'gitcommit']);
const DANGEROUS_PATTERNS = [
  /rm\s+-rf/,
  /mkfs/,
  /dd\s+if=/,
  /:(){ :\|:& };:/,
  /chmod\s+777/,
  /curl.*\|.*sh/,
  /sudo/,
];
const PROTECTED_PATTERNS = ['.env', 'credentials', 'secrets', '*.pem', 'id_rsa', /.ssh\//, /\.git\/config/];

export interface GateResult {
  block?: boolean;
  reason?: string;
  needsConfirmation?: boolean;
}

export function permissionGate(
  mode: PermissionMode,
  toolCall: { name: string },
  args: Record<string, unknown>
): GateResult {
  const toolName = toolCall.name.toLowerCase();
  const isDestructive = DESTRUCTIVE_TOOLS.has(toolName);

  if (isDestructive && toolName === 'bash') {
    const cmd = (args as { command: string }).command || '';
    if (DANGEROUS_PATTERNS.some(p => p.test(cmd))) {
      return { block: true, reason: `Dangerous command blocked: ${cmd}` };
    }
  }

  if (isDestructive && (toolName === 'write' || toolName === 'edit')) {
    const filepath = (args as { filepath: string }).filepath || (args as { path: string }).path || '';
    if (PROTECTED_PATTERNS.some(p => filepath.match(p))) {
      return { block: true, reason: `Protected path: ${filepath}` };
    }
  }

  if (mode === 'deny') {
    if (isDestructive) {
      return { block: true, reason: `${toolCall.name} blocked (deny mode)` };
    }
    return {};
  }

  if (mode === 'confirm' && isDestructive) {
    return { needsConfirmation: true };
  }

  return {};
}