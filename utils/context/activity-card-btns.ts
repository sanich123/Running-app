import { createContext } from 'react';

export const ActivityCardBtnsContext = createContext({
  isLoading: false,
  setIsLoading: (arg: boolean) => {},
  isDisabled: false,
  setIsDisabled: (arg: boolean) => {},
});
