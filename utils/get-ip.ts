import { fetchWithTimeout } from './middleware';

// 从 URL 中提取域名
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

// 使用第三方 DNS over HTTPS 服务
export const getIP = async (domain: string): Promise<string[]> => {
  const cleanDomain = extractDomain(domain);

  try {
    const response = await fetchWithTimeout(
      `https://dns.google/resolve?name=${cleanDomain}&type=A`,
      {},
      10000
    );
    const data = await response.json();
    return data.Answer?.map((r: any) => r.data) || [];
  } catch (error) {
    console.error('Google DoH failed:', error);
    return [];
  }
};

// 使用 Cloudflare DoH
export const getIPCloudflare = async (domain: string): Promise<string[]> => {
  const cleanDomain = extractDomain(domain);

  try {
    const response = await fetchWithTimeout(
      `https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=A`,
      { headers: { Accept: 'application/dns-json' } },
      10000
    );
    const data = await response.json();
    return data.Answer?.map((r: any) => r.data) || [];
  } catch (error) {
    console.error('Cloudflare DoH failed:', error);
    return [];
  }
};

// 获取 IP（优先使用 Google，失败时尝试 Cloudflare）
export const getIPAddress = async (url: string): Promise<string[]> => {
  const domain = extractDomain(url);

  // 先尝试 Google DNS
  let ips = await getIP(domain);

  // 如果 Google 失败，尝试 Cloudflare
  if (ips.length === 0) {
    ips = await getIPCloudflare(domain);
  }

  return ips;
};

export default getIPAddress;
