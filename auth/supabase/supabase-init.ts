import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

const ExpoSecureStoreAdapter = {
  getItem: async (key) => {
    let attempts = 0;
    while (attempts < 5) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.log(error);
        attempts++;
      }
    }
    return false;
  },

  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(url as string, key as string, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    detectSessionInUrl: false,
    autoRefreshToken: true,
    persistSession: true,
  },
});
