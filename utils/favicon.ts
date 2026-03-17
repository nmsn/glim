/**
 * 获取网站的图标URL
 * @param url - 网站URL
 * @returns 图标URL数组
 */
export async function getFavicon(url: string): Promise<string[]> {
  try {
    const faviconUrls: string[] = [];
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
    
    // 尝试获取当前标签页的内容来查找图标
    try {
      // 在内容脚本中执行，以避免跨域问题
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        const result = await browser.tabs.sendMessage(tab.id, { action: 'GET_FAVICONS' });
        if (result && result.favicons && Array.isArray(result.favicons)) {
          return result.favicons;
        }
      }
    } catch (error) {
      console.debug('无法从内容脚本获取图标，尝试默认路径:', error);
      // 继续尝试默认路径
    }
    
    // 如果内容脚本没有返回图标，尝试默认路径
    const defaultPaths = [
      '/favicon.ico',
      '/favicon.png',
      '/apple-touch-icon.png',
      '/apple-touch-icon-precomposed.png',
    ];
    
    for (const path of defaultPaths) {
      const iconUrl = baseUrl + path;
      try {
        // 创建一个临时的Image对象来检查图标是否存在
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => reject();
          // 设置一个较短的超时时间
          setTimeout(() => reject(), 3000);
          img.src = iconUrl;
        });
        
        faviconUrls.push(iconUrl);
        break; // 找到一个就停止
      } catch (error) {
        // 忽略错误，尝试下一个路径
        console.debug(`无法访问图标: ${iconUrl}`, error);
      }
    }
    
    return faviconUrls;
  } catch (error) {
    console.error('获取网站图标失败:', error);
    return [];
  }
}

/**
 * 获取网站的主要图标（第一个可用的图标）
 * @param url - 网站URL
 * @returns 主要图标URL
 */
export async function getMainFavicon(url: string): Promise<string | null> {
  const favicons = await getFavicon(url);
  return favicons.length > 0 ? favicons[0] : null;
}