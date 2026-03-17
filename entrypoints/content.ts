import { browser } from 'wxt/browser';
import { getSocialTags, type SocialTagResult } from '../utils/social-tag';

// 获取页面上的所有图标
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

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('Hello content.');

    const metadata = getSocialTags();
    console.log('metadata', metadata);

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'GET_SOCIAL_TAGS') {
        const tags = getSocialTags();
        sendResponse({ success: true, data: tags });
      } else if (message.action === 'GET_FAVICONS') {
        const favicons = getFaviconsFromPage();
        sendResponse({ favicons });
      }
      return true;
    });
  },
});
