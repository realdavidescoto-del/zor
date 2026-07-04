type PendingConfirmation = {
  resolve: (approved: boolean) => void;
  toolName: string;
  args: Record<string, unknown>;
};

let pending: PendingConfirmation | null = null;
let onChangeCallback: ((info: PendingConfirmation | null) => void) | null = null;

export function setConfirmationCallback(cb: (info: PendingConfirmation | null) => void) {
  onChangeCallback = cb;
}

export async function requestToolConfirmation(toolName: string, args: Record<string, unknown>): Promise<boolean> {
  return new Promise((resolve) => {
    pending = { resolve, toolName, args };
    if (onChangeCallback) onChangeCallback(pending);
  });
}

export function getPendingConfirmation(): PendingConfirmation | null {
  return pending;
}

export function resolveConfirmation(approved: boolean) {
  if (pending) {
    pending.resolve(approved);
    pending = null;
    if (onChangeCallback) onChangeCallback(null);
  }
}
