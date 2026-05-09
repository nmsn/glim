import { browser } from 'wxt/browser';
import { getSocialTags, type SocialTagResult } from '../utils/social-tag';

function getFaviconsFromPage(): string[] {
  const icons: string[] = [];
  const iconSelectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
    'link[rel="mask-icon"]',
    'link[rel="icon shortcut"]',
    'link[rel="fluid-icon"]',
    'link[type="image/x-icon"]',
    'link[type="image/png"]',
    'link[type="image/jpeg"]',
    'link[type="image/gif"]',
    'link[type="image/svg+xml"]',
  ];

  iconSelectors.forEach(selector => {
    const elements = document.querySelectorAll<HTMLLinkElement>(selector);
    elements.forEach(el => {
      const href = el.getAttribute('href');
      if (href) {
        const absoluteUrl = new URL(href, document.baseURI).href;
        if (!icons.includes(absoluteUrl)) {
          icons.push(absoluteUrl);
        }
      }
    });
  });

  return icons;
}

function getPageInfoFromDOM() {
  return {
    url: window.location.href,
    title: document.title,
    referrer: document.referrer,
    contentType: document.contentType || null,
    charset: document.characterSet || null,
  };
}

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'GET_SOCIAL_TAGS') {
        const tags = getSocialTags();
        sendResponse({ success: true, data: tags });
      } else if (message.type === 'GET_FAVICONS') {
        const favicons = getFaviconsFromPage();
        sendResponse({ success: true, data: favicons });
      } else if (message.type === 'GET_PAGE_INFO') {
        try {
          const info = getPageInfoFromDOM();
          sendResponse({ success: true, data: info });
        } catch (error: any) {
          sendResponse({ success: false, error: error.message });
        }
      }
      return true;
    });
  },
});
