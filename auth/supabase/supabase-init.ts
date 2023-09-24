import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

const url = 'https://rrlmesbmowaoyzvniffr.supabase.co';
const key =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybG1lc2Jtb3dhb3l6dm5pZmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUzNTgwODAsImV4cCI6MjAxMDkzNDA4MH0.SKHRR9lL8jnL_YkmzbAKRbhBfgabxqQU7CQwK85p_Oo';

export const supabase = createClient(url as string, key as string, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    detectSessionInUrl: false,
    autoRefreshToken: true,
    persistSession: true,
  },
});
