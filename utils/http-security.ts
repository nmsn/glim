import { getResponseHeaders, type Headers } from './headers';

export interface SecurityHeaders {
  strictTransportPolicy: boolean;
  xFrameOptions: boolean;
  xContentTypeOptions: boolean;
  xXSSProtection: boolean;
  contentSecurityPolicy: boolean;
}

export const checkSecurityHeadersFromHeaders = (headers: Record<string, string>): SecurityHeaders => {
  return {
    strictTransportPolicy: !!headers['strict-transport-security'],
    xFrameOptions: !!headers['x-frame-options'],
    xContentTypeOptions: !!headers['x-content-type-options'],
    xXSSProtection: !!headers['x-xss-protection'],
    contentSecurityPolicy: !!headers['content-security-policy'],
  };
};

export const checkSecurityHeaders = async (url: string): Promise<SecurityHeaders> => {
  const headers = await getResponseHeaders(url);
  return checkSecurityHeadersFromHeaders(headers);
};

export default checkSecurityHeaders;
