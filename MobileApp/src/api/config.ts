import { NativeModules } from 'react-native';

export const LIVE_API_BASE_URL = 'https://jobmarket-8c0p.onrender.com';

export const getDevApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  // If explicitly defined via EXPO_PUBLIC_API_URL, validate and use it
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim();
    // In preview / standalone APK / production release builds, ignore any local LAN/private IP and fallback to live server
    if (!__DEV__ && (trimmed.includes('localhost') || trimmed.includes('127.0.0.1') || trimmed.includes('192.168.') || trimmed.includes('10.0.2.2'))) {
      return LIVE_API_BASE_URL;
    }
    return trimmed;
  }

  // In local development (__DEV__ === true), dynamically extract host IP from Metro scriptURL
  if (__DEV__) {
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/https?:\/\/([^:/]+)/);
      const host = match ? match[1] : null;
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:5000`;
      }
    }
    return 'http://localhost:5000';
  }

  // Standalone APK and production release builds fallback to the live Render server
  return LIVE_API_BASE_URL;
};

// CANONICAL BACKEND API URL (auto-resolves local LAN host during dev, falls back to live server in APK/production)
export const API_BASE_URL = getDevApiBaseUrl();
