import { createContext } from 'react';

export const SaveSettingsContext = createContext({
  photoUrl: '',
  isLoading: false,
  setIsLoading: (arg: boolean) => {},
});
