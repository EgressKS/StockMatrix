import Constants from 'expo-constants';

// Get configuration from expo-constants works for both local and EAS builds
const extra = Constants.expoConfig?.extra || {};

// Fallback order: expo-constants -> environment variables
export const API_BASE_URL = extra.apiBaseUrl || process.env.API_BASE_URL || 'http://172.70.99.19:3000/api';
export const GOOGLE_WEB_CLIENT_ID = extra.googleWebClientId || process.env.GOOGLE_WEB_CLIENT_ID || '';
export const GOOGLE_ANDROID_CLIENT_ID = extra.googleAndroidClientId || process.env.GOOGLE_ANDROID_CLIENT_ID || '';
export const GOOGLE_IOS_CLIENT_ID = extra.googleIosClientId || process.env.GOOGLE_IOS_CLIENT_ID || '';
