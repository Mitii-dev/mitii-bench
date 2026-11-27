function wait(delay, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Request aborted"));
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, delay);

    function onAbort() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("Request aborted"));
    }

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function requestWithRetry(
  request,
  {
    maxRetries = 3,
    baseDelay = 500,
    maxDelay = 30000,
    signal,
    onRetry = () => {},
    onAttempt = () => {},
  } = {},
) {
  let retryIndex = 0;

  while (true) {
    if (signal?.aborted) {
      throw new Error("Request aborted");
    }

    onAttempt(retryIndex + 1);

    try {
      return await request({
        signal,
        attempt: retryIndex + 1,
      });
    } catch (error) {
      if (signal?.aborted) {
        throw new Error("Request aborted");
      }

      if (retryIndex >= maxRetries) {
        throw error;
      }

      const delay = Math.min(baseDelay * 2 ** retryIndex, maxDelay);

      onRetry({
        attempt: retryIndex + 1,
        nextAttempt: retryIndex + 2,
        delay,
        error,
      });

      await wait(delay, signal);

      retryIndex++;
    }
  }
}
