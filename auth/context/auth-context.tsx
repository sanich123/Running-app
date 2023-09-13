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
        initialized,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
