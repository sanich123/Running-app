import { Platform } from 'react-native';

const PRODUCTION_API_URL = process.env.EXPO_PUBLIC_BASE_URL ?? 'https://runich-backend-production.up.railway.app';
const DEVELOPMENT_WEB_API_URL = process.env.EXPO_PUBLIC_DEV_WEB_API_URL ?? 'http://localhost:3000';
const DEVELOPMENT_NATIVE_API_URL = process.env.EXPO_PUBLIC_DEV_NATIVE_API_URL ?? 'http://192.168.0.16:3000';

const isDevelopment = process.env.EXPO_PUBLIC_APP_ENV === 'development';

export const API_URL = isDevelopment
  ? Platform.OS === 'web'
    ? DEVELOPMENT_WEB_API_URL
    : DEVELOPMENT_NATIVE_API_URL
  : PRODUCTION_API_URL;
