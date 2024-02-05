import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    let attempts = 0;
    while (attempts < 5) {
      try {
        if (Platform.OS === 'web') {
          return await AsyncStorage.getItem(key);
        } else {
          return await SecureStore.getItemAsync(key);
        }
      } catch (error) {
        console.log(error);
        attempts++;
      }
    }
    return false;
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      return await AsyncStorage.setItem(key, value);
    } else {
      return SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(key);
    } else {
      SecureStore.deleteItemAsync(key);
    }
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
