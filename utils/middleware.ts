const TIMEOUT = import.meta.env.WXT_API_TIMEOUT_LIMIT
  ? parseInt(import.meta.env.WXT_API_TIMEOUT_LIMIT as string, 10)
  : 60000;

const DISABLE_EVERYTHING = !!import.meta.env.WXT_DISABLE_EVERYTHING;

const disabledErrorMsg = 'Web Check is temporarily disabled.';

const normalizeUrl = (url: string) => {
  return url.startsWith('http') ? url : `https://${url}`;
};

const createTimeoutPromise = (timeoutMs: number) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed-out after ${timeoutMs} ms`));
    }, timeoutMs);
  });
};

export const fetchWithTimeout = async (
  url: string,
  options?: RequestInit,
  timeoutMs: number = TIMEOUT
): Promise<Response> => {
  if (DISABLE_EVERYTHING) {
    throw new Error(disabledErrorMsg);
  }

  const normalizedUrl = normalizeUrl(url);

  return Promise.race([
    fetch(normalizedUrl, options),
    createTimeoutPromise(timeoutMs),
  ]) as Promise<Response>;
};
