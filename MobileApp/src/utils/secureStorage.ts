import * as SecureStore from 'expo-secure-store';
import { User, AuthTokens } from '../types';

const ACCESS_TOKEN_KEY = 'csn_employer_access_token';
const REFRESH_TOKEN_KEY = 'csn_employer_refresh_token';
const SESSION_ID_KEY = 'csn_employer_session_id';
const USER_KEY = 'csn_employer_user';

// In-Memory Fast Cache to eliminate async storage race conditions
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;
let memorySessionId: string | null = null;
let memoryUser: User | null = null;

export const saveTokens = async (tokens: AuthTokens, sessionId?: string): Promise<void> => {
  memoryAccessToken = tokens.accessToken;
  memoryRefreshToken = tokens.refreshToken;
  if (sessionId) memorySessionId = sessionId;

  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
      if (sessionId) {
        await SecureStore.setItemAsync(SESSION_ID_KEY, sessionId);
      }
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      if (sessionId) localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
  } catch (error) {
    console.warn('SecureStore save error (using memory cache):', error);
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (memoryAccessToken) return memoryAccessToken;
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      memoryAccessToken = token;
      return token;
    } else if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      memoryAccessToken = token;
      return token;
    }
  } catch (error) {
    return memoryAccessToken;
  }
  return memoryAccessToken;
};

export const getRefreshToken = async (): Promise<string | null> => {
  if (memoryRefreshToken) return memoryRefreshToken;
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      memoryRefreshToken = token;
      return token;
    } else if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem(REFRESH_TOKEN_KEY);
      memoryRefreshToken = token;
      return token;
    }
  } catch (error) {
    return memoryRefreshToken;
  }
  return memoryRefreshToken;
};

export const getSessionId = async (): Promise<string | null> => {
  if (memorySessionId) return memorySessionId;
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      const id = await SecureStore.getItemAsync(SESSION_ID_KEY);
      memorySessionId = id;
      return id;
    } else if (typeof localStorage !== 'undefined') {
      const id = localStorage.getItem(SESSION_ID_KEY);
      memorySessionId = id;
      return id;
    }
  } catch (error) {
    return memorySessionId;
  }
  return memorySessionId;
};

export const saveStoredUser = async (user: User): Promise<void> => {
  memoryUser = user;
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    const json = JSON.stringify(user);
    if (isAvailable) {
      await SecureStore.setItemAsync(USER_KEY, json);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(USER_KEY, json);
    }
  } catch (error) {
    console.warn('SecureStore user save error:', error);
  }
};

export const getStoredUser = async (): Promise<User | null> => {
  if (memoryUser) return memoryUser;
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      const json = await SecureStore.getItemAsync(USER_KEY);
      if (json) {
        memoryUser = JSON.parse(json);
        return memoryUser;
      }
    } else if (typeof localStorage !== 'undefined') {
      const json = localStorage.getItem(USER_KEY);
      if (json) {
        memoryUser = JSON.parse(json);
        return memoryUser;
      }
    }
  } catch (error) {
    return memoryUser;
  }
  return memoryUser;
};

export const clearAuthSession = async (): Promise<void> => {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  memorySessionId = null;
  memoryUser = null;

  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SESSION_ID_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
      localStorage.removeItem(USER_KEY);
    }
  } catch (error) {
    console.warn('Error clearing auth session:', error);
  }
};
