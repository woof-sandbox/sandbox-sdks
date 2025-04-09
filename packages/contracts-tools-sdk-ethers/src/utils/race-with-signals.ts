import { createSignalsPromise } from "./create-signals-promise";

export async function raceWithSignals<T>(
  racer: () => Promise<T>,
  signals: AbortSignal[] = [],
): Promise<T> {
  for (const signal of signals) {
    if (signal.aborted) {
      throw new DOMException("Operation aborted", "AbortError");
    }
  }

  return Promise.race([racer(), createSignalsPromise(signals)]);
}
