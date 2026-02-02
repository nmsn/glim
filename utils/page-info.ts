export interface PageInfo {
  url: string;
  title: string;
  html: string;
  referrer: string;
  contentType: string | null;
  charset: string | null;
}

export const getPageInfo = async (): Promise<PageInfo> => {
  const url = window.location.href;
  const title = document.title;
  const html = document.documentElement.outerHTML;
  const referrer = document.referrer;
  const contentType = document.contentType || null;
  const charset = document.characterSet || null;

  return { url, title, html, referrer, contentType, charset };
};

export default getPageInfo;
