export function createTimeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort("Timeout exceeded"), ms);
  return controller.signal;
}
