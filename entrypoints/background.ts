import { browser } from 'wxt/browser';
import { fetchServerLocation } from '../utils/server-location';

interface WebRequestDetails {
  url: string;
  type: string;
  tabId: number;
  responseHeaders?: Array<{ name?: string | null; value?: string | null }>;
  timeStamp: number;
}

const tabHeaders: Map<string, Record<string, string>> = new Map();

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname;
  } catch {
    return url;
  }
}

export default defineBackground(() => {
  browser.webRequest.onHeadersReceived.addListener(
    (details: WebRequestDetails) => {
      if (details.type === 'main_frame') {
        const headers: Record<string, string> = {};
        details.responseHeaders?.forEach((header) => {
          if (header.name && header.value) {
            headers[header.name] = header.value;
          }
        });
        const normalizedUrl = normalizeUrl(details.url);
        tabHeaders.set(normalizedUrl, headers);
        console.log('[Background] 缓存 headers:', normalizedUrl, headers);
        return undefined;
      }
    },
    { urls: ['<all_urls>'] },
    ['responseHeaders']
  );

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Background] 收到消息:', message);

    if (message.type === 'GET_SERVER_LOCATION') {
      const { ip } = message.data;

      fetchServerLocation(ip)
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });

      return true;
    }

    if (message.type === 'GET_RESPONSE_HEADERS') {
      const { url } = message.data;
      const normalizedUrl = normalizeUrl(url);

      console.log('[Background] 请求 headers:', url, '->', normalizedUrl);
      console.log('[Background] 缓存的 URLs:', Array.from(tabHeaders.keys()));

      const cachedHeaders = tabHeaders.get(normalizedUrl);
      if (cachedHeaders) {
        console.log('[Background] 使用缓存');
        sendResponse({ success: true, headers: cachedHeaders });
      } else {
        console.log('[Background] 未找到缓存，监听新请求...');
        const listener = (details: WebRequestDetails) => {
          if (normalizeUrl(details.url) === normalizedUrl) {
            const headers: Record<string, string> = {};
            details.responseHeaders?.forEach((header) => {
              if (header.name && header.value) {
                headers[header.name] = header.value;
              }
            });
            tabHeaders.set(normalizedUrl, headers);
            browser.webRequest.onResponseStarted.removeListener(listener);
            sendResponse({ success: true, headers });
          }
        };
        browser.webRequest.onResponseStarted.addListener(
          listener,
          { urls: [normalizedUrl], types: ['main_frame'] }
        );
      }

      return true;
    }

    sendResponse({ success: false, error: '未知的消息类型' });
    return false;
  });
});
