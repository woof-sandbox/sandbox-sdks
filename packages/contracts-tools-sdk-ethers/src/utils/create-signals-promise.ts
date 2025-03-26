export function createSignalsPromise(signals: AbortSignal[] = []): Promise<never> {
  return new Promise((_, reject) => {
    const onAbort = (signal: AbortSignal) => reject(signal.reason || new Error('Operation aborted'));

    for (const signal of signals) {
      signal.addEventListener('abort', () => onAbort(signal), { once: true });
    }
  });
}
