import { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import { useState, useEffect, createContext, PropsWithChildren, useContext } from 'react';

import { supabase } from '../supabase/supabase-init';

type AuthProps = {
  user: User | null;
  session: Session | null;
  initialized?: boolean;
  signOut?: () => void;
};
export const AuthContext = createContext<Partial<AuthProps>>({});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session ? session.user : null);
      setInitialized(true);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Log out the user
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && inTabsGroup) {
      router.replace('/(auth)/sign-in');
    } else if (user && !inTabsGroup) {
      router.replace('/');
    }
  }, [user, segments]);

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
};
