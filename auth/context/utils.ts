import { supabase } from '@A/supabase/supabase-init';
import { createContext, useContext } from 'react';
import { AuthProps } from './types';

export async function signOut() {
  await supabase.auth.signOut();
}
export const AuthContext = createContext<Partial<AuthProps>>({});

export function useAuth() {
  return useContext(AuthContext);
}
