import { browser } from 'wxt/browser';

export interface DnsResult {
  addresses: string[];
}

export const resolveDns = async (hostname: string): Promise<DnsResult> => {
  return new Promise((resolve, reject) => {
    if (!browser.dns?.resolve) {
      reject(new Error('DNS API 不可用'));
      return;
    }

    browser.dns.resolve(hostname, (result) => {
      if (browser.runtime.lastError) {
        reject(new Error(browser.runtime.lastError.message));
      } else {
        resolve({
          addresses: result.addresses || []
        });
      }
    });
  });
};

export default resolveDns;
