export interface SocialTagResult {
  // Basic meta tags
  title: string | null;
  description: string | null;
  keywords: string | null;
  canonicalUrl: string | null;

  // OpenGraph Protocol
  ogTitle: string | null;
  ogType: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  ogDescription: string | null;
  ogSiteName: string | null;

  // Twitter Cards
  twitterCard: string | null;
  twitterSite: string | null;
  twitterCreator: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;

  // Misc
  themeColor: string | null;
  robots: string | null;
  googlebot: string | null;
  generator: string | null;
  viewport: string | null;
  author: string | null;
  publisher: string | null;
  favicon: string | null;
}

function getMetaContent(selector: string, property: string = 'content'): string | null {
  const element = document.querySelector(selector);
  return element?.getAttribute(property) || null;
}

export const getSocialTags = (): SocialTagResult => {
  const metadata: SocialTagResult = {
    // Basic meta tags
    title: document.title || null,
    description: getMetaContent('meta[name="description"]'),
    keywords: getMetaContent('meta[name="keywords"]'),
    canonicalUrl: getMetaContent('link[rel="canonical"]', 'href'),

    // OpenGraph Protocol
    ogTitle: getMetaContent('meta[property="og:title"]'),
    ogType: getMetaContent('meta[property="og:type"]'),
    ogImage: getMetaContent('meta[property="og:image"]'),
    ogUrl: getMetaContent('meta[property="og:url"]'),
    ogDescription: getMetaContent('meta[property="og:description"]'),
    ogSiteName: getMetaContent('meta[property="og:site_name"]'),

    // Twitter Cards
    twitterCard: getMetaContent('meta[name="twitter:card"]'),
    twitterSite: getMetaContent('meta[name="twitter:site"]'),
    twitterCreator: getMetaContent('meta[name="twitter:creator"]'),
    twitterTitle: getMetaContent('meta[name="twitter:title"]'),
    twitterDescription: getMetaContent('meta[name="twitter:description"]'),
    twitterImage: getMetaContent('meta[name="twitter:image"]'),

    // Misc
    themeColor: getMetaContent('meta[name="theme-color"]'),
    robots: getMetaContent('meta[name="robots"]'),
    googlebot: getMetaContent('meta[name="googlebot"]'),
    generator: getMetaContent('meta[name="generator"]'),
    viewport: getMetaContent('meta[name="viewport"]'),
    author: getMetaContent('meta[name="author"]'),
    publisher: getMetaContent('link[rel="publisher"]', 'href'),
    favicon: getMetaContent('link[rel="icon"]', 'href') || getMetaContent('link[rel="shortcut icon"]', 'href'),
  };

  return metadata;
};

export default getSocialTags;
