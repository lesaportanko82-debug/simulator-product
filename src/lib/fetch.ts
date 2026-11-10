/**
 * fetchWithRetry — wraps fetch with:
 *  - per-attempt AbortSignal timeout (default 8 s)
 *  - configurable retry count
 *  - exponential back-off (500 ms, 1 000 ms, …)
 *
 * The abort reason is set explicitly so browsers don't log
 * the confusing "AbortError: signal is aborted without reason".
 */
export const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  retries = 3,
  timeoutMs = 8000
): Promise<Response> => {
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    // Provide an explicit reason so the DOMException has a clear message
    const timeoutReason = new DOMException(
      `Request timed out after ${timeoutMs} ms`,
      'TimeoutError'
    );
    const timer = setTimeout(() => controller.abort(timeoutReason), timeoutMs);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (e) {
      clearTimeout(timer);
      lastError = e;

      const isTimeout =
        e instanceof DOMException &&
        (e.name === 'TimeoutError' || e.name === 'AbortError');

      if (isTimeout) {
        console.warn(
          `Fetch attempt ${i + 1} timed out (${timeoutMs} ms) for ${url}.` +
            (i < retries - 1 ? ' Retrying…' : ' No more retries.')
        );
      } else {
        console.warn(
          `Fetch attempt ${i + 1} failed for ${url}.` +
            (i < retries - 1 ? ' Retrying…' : ' No more retries.'),
          e
        );
      }

      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
      }
    }
  }

  throw lastError;
};
