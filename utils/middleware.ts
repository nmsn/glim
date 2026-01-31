// If present, set a shorter timeout for API requests
const TIMEOUT = import.meta.env.WXT_API_TIMEOUT_LIMIT
  ? parseInt(import.meta.env.WXT_API_TIMEOUT_LIMIT as string, 10)
  : 60000;

// If present, set CORS allowed origins for responses
const ALLOWED_ORIGINS = import.meta.env.WXT_API_CORS_ORIGIN || '*';

// Disable everything :( Setting this env var will turn off the instance, and show message
const DISABLE_EVERYTHING = !!import.meta.env.WXT_DISABLE_EVERYTHING;

const timeoutErrorMsg = 'You can re-trigger this request, by clicking "Retry"\n'
  + 'If you\'re running your own instance of Web Check, then you can '
  + 'resolve this issue, by increasing the timeout limit in the '
  + '`API_TIMEOUT_LIMIT` environmental variable to a higher value (in milliseconds), '
  + 'or if you\'re hosting on Vercel increase the maxDuration in vercel.json.\n\n'
  + `The public instance currently has a lower timeout of ${TIMEOUT}ms `
  + 'in order to keep running costs affordable, so that Web Check can '
  + 'remain freely available for everyone.';

const disabledErrorMsg = 'Error - WebCheck Temporarily Disabled.\n\n'
  + 'We\'re sorry, but due to the increased cost of running Web Check '
  + 'we\'ve had to temporatily disable the public instand. '
  + 'We\'re activley looking for affordable ways to keep Web Check running, '
  + 'while free to use for everybody.\n'
  + 'In the meantime, since we\'ve made our code free and open source, '
  + 'you can get Web Check running on your own system, by following the instructions in our GitHub repo';

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

interface HandlerResponse {
  body?: any;
  statusCode?: number;
}

type HandlerFunction = (url: string, request?: any) => Promise<HandlerResponse | string | object>;

interface MiddlewareResponse {
  status: number;
  body: any;
  headers?: Record<string, string>;
}

// Browser extension compatible handler
const browserHandler = async (rawUrl: string, request?: any, handler?: HandlerFunction): Promise<MiddlewareResponse> => {
  if (DISABLE_EVERYTHING) {
    return {
      status: 503,
      body: { error: disabledErrorMsg },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
      },
    };
  }

  if (!rawUrl) {
    return {
      status: 500,
      body: { error: 'No URL specified' },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
      },
    };
  }

  const url = normalizeUrl(rawUrl);

  try {
    if (!handler) {
      throw new Error('No handler function provided');
    }

    // Race the handler against the timeout
    const handlerResponse = await Promise.race([
      handler(url, request),
      createTimeoutPromise(TIMEOUT),
    ]);

    let responseBody: any;
    let statusCode = 200;

    if (handlerResponse && typeof handlerResponse === 'object') {
      if ('body' in handlerResponse && 'statusCode' in handlerResponse) {
        responseBody = handlerResponse.body;
        statusCode = handlerResponse.statusCode || 200;
      } else {
        responseBody = handlerResponse;
      }
    } else if (typeof handlerResponse === 'string') {
      try {
        responseBody = JSON.parse(handlerResponse);
      } catch {
        responseBody = { data: handlerResponse };
      }
    } else {
      responseBody = handlerResponse;
    }

    return {
      status: statusCode,
      body: responseBody,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
      },
    };
  } catch (error: any) {
    let errorCode = 500;
    let errorMessage = error.message || 'Unknown error';

    if (errorMessage.includes('timed-out')) {
      errorCode = 408;
      errorMessage = `${errorMessage}\n\n${timeoutErrorMsg}`;
    }

    return {
      status: errorCode,
      body: { error: errorMessage },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
      },
    };
  }
};

// Fetch with timeout helper for browser extension
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

// Main middleware function for browser extension
export const commonMiddleware = (handler: HandlerFunction) => {
  return async (rawUrl: string, request?: any): Promise<MiddlewareResponse> => {
    return browserHandler(rawUrl, request, handler);
  };
};

// Message handler for browser extension runtime messages
export const createMessageHandler = (handler: HandlerFunction) => {
  return async (message: any, sender?: any) => {
    const rawUrl = message?.url || message?.query?.url;
    const result = await browserHandler(rawUrl, { message, sender }, handler);
    return result.body;
  };
};

export default commonMiddleware;
