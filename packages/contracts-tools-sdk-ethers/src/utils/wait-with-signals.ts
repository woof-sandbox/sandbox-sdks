export function waitWithSignals(ms: number, signals: AbortSignal[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);

    if (signals.length) {
      function onAbort(signal: AbortSignal) {
        clearTimeout(timeout);
        reject(signal.reason || new Error('Operation aborted'));
      }

      for (const signal of signals) {
        signal.addEventListener('abort', () => onAbort(signal), { once: true });
        if (signal.aborted) {
          onAbort(signal);
          return;
        }
      }
    }
  });
}
