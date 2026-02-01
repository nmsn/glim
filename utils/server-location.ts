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
