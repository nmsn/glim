import { browser } from 'wxt/browser';
import { getSocialTags, type SocialTagResult } from '../utils/social-tag';

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
      }
      return true;
    });
  },
});
