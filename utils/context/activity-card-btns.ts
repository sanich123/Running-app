import { createContext } from 'react';

export const ActivityCardBtnsContext = createContext({
  isLoading: false,
  setIsLoading: (arg: boolean): void => {
    if (arg) return;
  },
  isDisabled: false,
  setIsDisabled: (arg: boolean): void => {
    if (arg) return;
  },
});
