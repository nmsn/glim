import { browser } from 'wxt/browser';

export type Headers = Record<string, string>;

export const getResponseHeaders = async (url: string): Promise<Headers> => {
  const response = await browser.runtime.sendMessage({
    type: 'GET_RESPONSE_HEADERS',
    data: { url }
  });

  if (!response.success) {
    throw new Error(response.error || '获取 headers 失败');
  }

  return response.headers as Headers;
};

export default getResponseHeaders;
