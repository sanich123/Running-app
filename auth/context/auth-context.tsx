import { useRouter } from 'expo-router';
import { useState, useEffect, PropsWithChildren } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '../supabase/supabase-init';
import { Session, User } from '@supabase/supabase-js';
import { AuthContext, signOut } from './utils';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const { replace } = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session ? session.user : null);
    });
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session ? session.user : null);
    });
    setInitialized(true);
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    SplashScreen.hide();
    if (session) {
      replace('/');
    } else {
      replace('/sign-in');
    }
  }, [replace, session]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        initialized,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
