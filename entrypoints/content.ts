import { browser } from 'wxt/browser';
import { getSocialTags } from '../utils/social-tag';

const HTML_LIMIT = 500000;
const IMAGE_LIMIT = 200;
const NODE_LIMIT = 1000;
const CSS_NAMES_LIMIT = 500;
const CSS_VALUE_TRUNCATE_LENGTH = 160;
const GLOBAL_KEYS_LIMIT = 5000;

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

function collectPageData() {
  // 收集 scripts
  const scripts = [...document.scripts].map(s => s.src).filter(isInspectableUrl);

  // 收集 stylesheets
  const stylesheets = [...document.querySelectorAll("link[rel~='stylesheet'], link[as='style']")]
    .map(l => (l as HTMLLinkElement).href)
    .filter(isInspectableUrl);

  // 收集 resource timing
  let resourceTiming: string[] = [];
  try {
    resourceTiming = performance.getEntriesByType('resource').map(e => e.name).filter(isInspectableUrl);
  } catch (e) {
    console.warn('Failed to get resource timing:', e);
  }

  // 收集 images
  const images = [...document.images].map(i => i.currentSrc || i.src).filter(isInspectableUrl).slice(0, IMAGE_LIMIT);

  // 收集所有资源
  const allResources = [...new Set([...scripts, ...stylesheets, ...resourceTiming, ...images])];

  // 收集 class tokens
  const classTokens: Record<string, number> = {};
  const nodes = document.querySelectorAll('[class]');
  const limit = Math.min(nodes.length, NODE_LIMIT);
  for (let i = 0; i < limit; i++) {
    const list = nodes[i].classList;
    if (list && list.length) {
      for (let j = 0; j < list.length; j++) {
        const token = list[j];
        if (token) classTokens[token] = (classTokens[token] || 0) + 1;
      }
    }
  }

  // 收集 CSS 变量
  const cssNames: string[] = [];
  const cssValues: Record<string, string> = {};
  const targets = [document.documentElement, document.body].filter(Boolean);
  for (const target of targets) {
    try {
      const style = getComputedStyle(target);
      for (let index = 0; index < style.length; index++) {
        const name = style.item(index);
        if (name && name.startsWith('--')) {
          cssNames.push(name);
          if (!cssValues[name]) cssValues[name] = style.getPropertyValue(name).trim().slice(0, CSS_VALUE_TRUNCATE_LENGTH);
        }
      }
    } catch (e) {
      console.warn('Failed to get computed style:', e);
    }
  }

  // HTML sample
  const html = String(document.documentElement?.outerHTML || '')
    .replace(/data:[^"'()<>\s]+/gi, '[inline-data-url]')
    .slice(0, HTML_LIMIT).toLowerCase();

  // Global keys (限制数量避免过大)
  let globalKeys: string[] = [];
  try {
    globalKeys = Object.keys(window).slice(0, GLOBAL_KEYS_LIMIT);
  } catch (e) {
    console.warn('Failed to collect global keys:', e);
  }

  return {
    url: window.location.href,
    title: document.title,
    scripts,
    stylesheets,
    resourceTiming,
    images,
    allResources,
    classes: classTokens,
    cssVariables: {
      names: cssNames.slice(0, CSS_NAMES_LIMIT),
      values: cssValues,
    },
    html,
    globalKeys,
  };
}

function isInspectableUrl(value: string): boolean {
  const url = String(value || '').trim();
  return Boolean(url) && !/^(?:data|blob|javascript|about):/i.test(url);
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
      } else if (message.type === 'GET_PAGE_DATA') {
        try {
          const data = collectPageData();
          sendResponse({ success: true, data });
        } catch (error: any) {
          sendResponse({ success: false, error: error.message });
        }
      }
      return true;
    });
  },
});
