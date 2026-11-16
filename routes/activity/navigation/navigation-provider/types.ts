import type { ReactNode } from 'react';

export interface NavigationProviderProps {
  isLocationReady: boolean;
  children: ReactNode;
}
