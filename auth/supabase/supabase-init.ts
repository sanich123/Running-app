import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import 'react-native-url-polyfill/auto';
import { AsyncStorageAdapter } from './async-storage/async-storage';
import LargeSecureStore from './secure-store/large-secure-store';

export const supabase = createClient(
  `${process.env.EXPO_PUBLIC_SUPABASE_URL}`,
  `${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
  {
    auth: {
      storage: Platform.OS === 'web' ? AsyncStorageAdapter : LargeSecureStore,
      detectSessionInUrl: false,
      autoRefreshToken: true,
      persistSession: true,
    },
  },
);
