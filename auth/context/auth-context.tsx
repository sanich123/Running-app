import { Href, usePathname, useRouter, useSegments } from 'expo-router';
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
  const segments = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session ? session.user : null);
      setInitialized(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const inTabsGroup = segments[0] === '(tabs)';
    if (!user && inTabsGroup) {
      replace('/(auth)/sign-in');
    } else if (user && !inTabsGroup) {
      if (pathname.includes('reset-password')) {
        replace('/change-password' as Href);
      } else {
        replace('/');
      }
    }
    SplashScreen.hide();
  }, [pathname, replace, segments, user]);

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
