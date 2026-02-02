import { browser } from 'wxt/browser';

export interface ServerLocation {
  city: string;
  country: string;
  coords: {
    lat: number;
    lon: number;
  };
  isp: string;
}

// 使用 ip-api.com 获取服务器位置（支持 CORS，免费版无需 API Key）
const fetchServerLocationFromIpApi = async (ip: string) => {
  const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city,lat,lon,isp,org`);
  const text = await response.text();

  // 检查返回的是否是 HTML（可能是验证页面或错误）
  if (text.trim().startsWith('<')) {
    throw new Error('API 返回了 HTML 页面，可能是验证或限制');
  }

  const data = JSON.parse(text);

  if (data.status !== 'success') {
    throw new Error(data.message || 'IP API 查询失败');
  }

  return {
    city: data.city,
    country: data.country,
    coords: { lat: data.lat, lon: data.lon },
    isp: data.isp || data.org,
  };
};

// 主函数：尝试多个 API
export const fetchServerLocation = async (ip: string) => {
  const errors: string[] = [];

  // 尝试 ip-api.com
  try {
    console.log('[Background] 尝试 ip-api.com:', ip);
    const result = await fetchServerLocationFromIpApi(ip);
    console.log('[Background] ip-api.com 成功:', result);
    return { success: true, data: result };
  } catch (error: any) {
    console.log('[Background] ip-api.com 失败:', error.message);
    errors.push(`ip-api.com: ${error.message}`);
  }

  // 所有 API 都失败
  return {
    success: false,
    error: `所有 IP 定位服务都失败:\n${errors.join('\n')}`
  };
};

// 通过 Background Script 获取服务器位置（绕过 CORS）
export const getServerLocation = async (ip: string): Promise<ServerLocation> => {
  const response = await browser.runtime.sendMessage({
    type: 'GET_SERVER_LOCATION',
    data: { ip }
  });

  if (!response.success) {
    throw new Error(response.error || '获取位置信息失败');
  }

  return response.data as ServerLocation;
};

export default getServerLocation;
