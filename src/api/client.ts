import axios, { AxiosInstance } from 'axios';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

const CURRENT_LAN_IP = '10.179.225.217';

const getNativeHostIp = (): string | null => {
  try {
    // 1. Primary Expo Go / Metro host resolution via expo-constants
    const hostUri =
      Constants?.expoConfig?.hostUri ||
      (Constants as any)?.manifest?.debuggerHost ||
      (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost;

    if (hostUri && typeof hostUri === 'string') {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  } catch (e) {}

  try {
    // 2. Fallback to NativeModules scriptURL (bare React Native / custom dev client)
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/:\/\/([^:/]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return match[1];
      }
    }
  } catch (e) {}

  return null;
};

// Helper to determine the best API base URL for physical device and emulator
export const resolveBaseUrl = (): string => {
  // 1. Explicit environment variable (EXPO_PUBLIC_API_URL from .env)
  if (process.env.EXPO_PUBLIC_API_URL && process.env.EXPO_PUBLIC_API_URL.trim()) {
    return process.env.EXPO_PUBLIC_API_URL.trim();
  }

  // 2. Physical phone / Emulator via Expo Go:
  // Auto-detect computer IP from Metro bundle or Constants
  const detectedIp = getNativeHostIp();
  if (detectedIp) {
    return `http://${detectedIp}:5000/api/v1`;
  }

  // 3. Fallback to active LAN IP of the host machine
  return `http://${CURRENT_LAN_IP}:5000/api/v1`;
};

export const API_BASE_URL = resolveBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

let currentAuthToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  currentAuthToken = token;
};

export const getAuthToken = (): string | null => {
  return currentAuthToken;
};

export const setOnUnauthorized = (handler: () => void) => {
  unauthorizedHandler = handler;
};

// Attach JWT Token and dynamic base URL to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const dynamicBase = resolveBaseUrl();
    if (dynamicBase) {
      config.baseURL = dynamicBase;
    }
    if (currentAuthToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentAuthToken}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.warn('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Global response interceptor for 401 Unauthorized & network errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error?.config?.url?.includes('/auth/login');
    if (!isLoginEndpoint) {
      console.log(`[API Response Error] ${error?.config?.baseURL}${error?.config?.url}:`, error?.message || error);
    }
    if (error.response && error.response.status === 401 && !isLoginEndpoint) {
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
