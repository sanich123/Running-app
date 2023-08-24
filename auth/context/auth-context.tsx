import { useSegments, useRouter } from 'expo-router';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect, createContext, PropsWithChildren, useContext } from 'react';

import { FIREBASE_AUTH } from '../../firebaseConfig';

interface AuthProps {
  user?: User | null;
  initialized: boolean;
}
export const AuthContext = createContext<AuthProps>({
  initialized: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>();
  const [initialized, setInitialized] = useState<boolean>(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      setInitialized(true);
    });
  }, []);

  const useProtectedRoute = () => {
    useEffect(() => {
      const inTabsGroup = segments[0] === '(tabs)';

      if (!user && inTabsGroup) {
        router.replace('/(auth)/sign-in');
        console.log('NOT AUTHENTICATED: ');
      } else if (user && !inTabsGroup) {
        console.log('AUTHENTICATED: ', user);
        router.replace('/');
      }
    }, [user, segments]);
  };

  useProtectedRoute();

  const value = {
    user,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
