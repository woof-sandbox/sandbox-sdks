export function checkSignals(signals: AbortSignal[] | undefined): void {
  if (signals) signals.forEach((signal) => signal.throwIfAborted());
}
