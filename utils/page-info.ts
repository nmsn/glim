import { browser } from 'wxt/browser';

export interface PageInfo {
  url: string;
  title: string;
  referrer: string;
  contentType: string | null;
  charset: string | null;
}

export const getPageInfo = async (): Promise<PageInfo> => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error('无法获取当前标签页');
  }

  const response = await browser.tabs.sendMessage(tab.id, { type: 'GET_PAGE_INFO' });
  if (!response?.success) {
    throw new Error(response?.error || '获取页面信息失败');
  }

  return response.data;
};

export default getPageInfo;
