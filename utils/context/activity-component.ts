import { createContext } from 'react';

export const ActivityComponentContext = createContext({
  isMapVisible: true,
  setIsMapVisible: (arg: boolean) => {},
});
