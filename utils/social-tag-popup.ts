import { browser } from 'wxt/browser';
import type { SocialTagResult } from './social-tag';

export const getSocialTagsFromContent = async (): Promise<SocialTagResult> => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.id) {
    throw new Error('无法获取当前标签页');
  }

  try {
    const response = await browser.tabs.sendMessage(tab.id, {
      type: 'GET_SOCIAL_TAGS'
    });

    if (!response.success) {
      throw new Error(response.error || '获取 social tags 失败');
    }

    return response.data as SocialTagResult;
  } catch (error) {
    throw new Error('页面可能尚未加载完成，请刷新页面后重试');
  }
};

export default getSocialTagsFromContent;
