import { browser } from 'wxt/browser';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // 使用 ip-api.com 获取服务器位置（支持 CORS，免费版无需 API Key）
  const getServerLocationFromIpApi = async (ip: string) => {
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
  const getServerLocation = async (ip: string) => {
    const errors: string[] = [];

    // 尝试 ip-api.com
    try {
      console.log('[Background] 尝试 ip-api.com:', ip);
      const result = await getServerLocationFromIpApi(ip);
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

  // 监听来自 popup 的消息
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Background] 收到消息:', message, '来自:', sender);

    if (message.type === 'GET_SERVER_LOCATION') {
      const { ip } = message.data;

      // 使用 Promise 处理异步操作
      getServerLocation(ip)
        .then(result => {
          console.log('[Background] 返回结果:', result);
          sendResponse(result);
        })
        .catch(error => {
          console.error('[Background] 处理错误:', error);
          sendResponse({ success: false, error: error.message });
        });

      // 返回 true 表示会异步发送响应
      return true;
    }

    sendResponse({ success: false, error: '未知的消息类型' });
    return false;
  });
});
