import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
  device: string;
  browser: string;
  os: string;
  userAgent: string;
}

export function parseUserAgent(userAgentString: string): DeviceInfo {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  const device = result.device.type 
    ? `${result.device.vendor || ''} ${result.device.model || ''}`.trim() || 'Unknown Device'
    : 'Desktop/Laptop';

  const browser = result.browser.name 
    ? `${result.browser.name} ${result.browser.version || ''}`.trim()
    : 'Unknown Browser';

  const os = result.os.name 
    ? `${result.os.name} ${result.os.version || ''}`.trim()
    : 'Unknown OS';

  return {
    device,
    browser,
    os,
    userAgent: userAgentString,
  };
}

export function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',');
    return ips[0].trim();
  }
  return req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown';
}
