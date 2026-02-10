import { browser } from 'wxt/browser';

interface DnsResolveResult {
  addresses?: string[];
}

interface WxtDns {
  resolve(hostname: string, callback: (result: DnsResolveResult) => void): void;
}

export interface DnsResult {
  addresses: string[];
}

export const resolveDns = async (hostname: string): Promise<DnsResult> => {
  return new Promise((resolve, reject) => {
    const dns = (browser as any).dns as WxtDns | undefined;
    if (!dns?.resolve) {
      reject(new Error('DNS API 不可用'));
      return;
    }

    dns.resolve(hostname, (result: DnsResolveResult) => {
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
