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

// IPv4 正则表达式
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// IPv6 正则表达式（简化版，支持常见格式）
const IPV6_REGEX = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}$|^(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}$|^(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}$|^:(?::[0-9a-fA-F]{1,4}){1,7}$|^::$/;

// 验证 IP 地址是否有效
export const isValidIP = (ip: string): boolean => {
  if (!ip || typeof ip !== 'string') return false;
  const trimmedIP = ip.trim();
  return IPV4_REGEX.test(trimmedIP) || IPV6_REGEX.test(trimmedIP);
};

// 过滤有效的 IP 地址
export const filterValidIPs = (ips: string[]): string[] => {
  const validIPs = ips.filter(isValidIP);
  const invalidIPs = ips.filter(ip => !isValidIP(ip));

  if (invalidIPs.length > 0) {
    console.warn('过滤掉无效的 IP 地址:', invalidIPs);
  }

  return validIPs;
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
    const rawIPs = data.Answer?.map((r: any) => r.data) || [];

    // 过滤有效的 IP 地址
    return filterValidIPs(rawIPs);
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
    const rawIPs = data.Answer?.map((r: any) => r.data) || [];

    // 过滤有效的 IP 地址
    return filterValidIPs(rawIPs);
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
