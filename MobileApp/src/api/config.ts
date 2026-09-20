import { NativeModules } from 'react-native';

export const getDevApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  // If defined in .env, always prioritize it
  if (envUrl) {
    return envUrl;
  }
  // In local development, extract host IP dynamically from Metro scriptURL (e.g. http://192.168.0.103:8081/index.bundle)
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^:/]+)/);
    const host = match ? match[1] : null;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:5000`;
    }
  }
  return 'http://localhost:5000';
};

// CANONICAL BACKEND API URL (auto-resolves local LAN host during dev, falls back to live server)
export const API_BASE_URL = getDevApiBaseUrl();
