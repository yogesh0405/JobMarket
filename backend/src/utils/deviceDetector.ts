export interface DetectedDeviceInfo {
  browser: string;
  os: string;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  deviceName: string;
  ipAddress: string;
  location: string;
}

/**
 * Extracts and cleans the real client IP address from request headers.
 */
export function extractClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  let ip = '';

  if (forwarded) {
    const parts = (typeof forwarded === 'string' ? forwarded : forwarded[0] || '').split(',');
    ip = parts[0].trim();
  }

  if (!ip) {
    ip = req.headers?.['x-real-ip'] || req.socket?.remoteAddress || req.ip || '127.0.0.1';
  }

  // Clean IPv6 localhost or v4 mapped v6
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }

  return ip;
}

/**
 * Parses user-agent header and client headers into clean, accurate device information.
 */
export function detectDeviceFromHeaders(
  userAgent: string = '',
  clientIp: string = '127.0.0.1',
  customDeviceName?: string,
  headers?: any
): DetectedDeviceInfo {
  const ua = (userAgent || '').trim();
  const lowerUa = ua.toLowerCase();
  const explicitPlatform = (headers?.['x-device-type'] || headers?.['x-client-platform'] || '').toLowerCase();
  const explicitDeviceName = headers?.['x-device-name'] || customDeviceName || '';

  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';

  // 1. Mobile Apps detection
  const isMobileApp =
    explicitPlatform.includes('mobile') ||
    explicitPlatform.includes('android') ||
    explicitPlatform.includes('ios') ||
    lowerUa.includes('jobmarketapp') ||
    lowerUa.includes('jobmarket mobile') ||
    lowerUa.includes('jobmarket/1.0') ||
    lowerUa.includes('okhttp') ||
    lowerUa.includes('dalvik') ||
    lowerUa.includes('cfnetwork') ||
    lowerUa.includes('expo') ||
    Boolean(explicitDeviceName && !explicitDeviceName.toLowerCase().includes('windows') && !explicitDeviceName.toLowerCase().includes('mac'));

  // 2. OS detection
  if (/android/i.test(ua) || explicitPlatform.includes('android')) {
    os = 'Android';
    deviceType = 'Mobile';
  } else if (/iphone|ipod/i.test(ua) || explicitPlatform.includes('ios') || explicitPlatform.includes('iphone')) {
    os = 'iOS';
    deviceType = 'Mobile';
  } else if (/ipad/i.test(ua) || explicitPlatform.includes('ipad')) {
    os = 'iPadOS';
    deviceType = 'Tablet';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
    deviceType = 'Desktop';
  } else if (/windows nt 10/i.test(ua)) {
    os = 'Windows 10/11';
    deviceType = 'Desktop';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
    deviceType = 'Desktop';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
    deviceType = 'Desktop';
  } else if (isMobileApp) {
    os = 'Android';
    deviceType = 'Mobile';
  }

  // 3. Browser / App detection
  if (isMobileApp) {
    browser = os === 'iOS' || os === 'iPadOS' ? 'JobMarket iOS App' : 'JobMarket Android App';
    deviceType = os === 'iPadOS' ? 'Tablet' : 'Mobile';
  } else if (/edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/opr\/|opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) {
    browser = 'Apple Safari';
  } else {
    browser = deviceType === 'Desktop' ? 'Google Chrome' : 'JobMarket Android App';
  }

  // 4. Construct human-readable device name
  let deviceName = '';
  if (explicitDeviceName && explicitDeviceName !== 'Web' && explicitDeviceName !== 'Unknown Device' && explicitDeviceName.length > 2) {
    deviceName = explicitDeviceName.includes('(') ? explicitDeviceName : `${explicitDeviceName} (${browser})`;
  } else if (isMobileApp) {
    deviceName = os === 'iOS' ? 'iPhone (JobMarket App)' : 'Android Phone (JobMarket App)';
  } else {
    deviceName = `${browser} on ${os}`;
  }

  return {
    browser,
    os,
    deviceType,
    deviceName,
    ipAddress: clientIp,
    location: 'Maharashtra, India',
  };
}
