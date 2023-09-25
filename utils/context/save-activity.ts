import { createContext } from 'react';

export const SaveActivityContext = createContext({
  title: '',
  setTitle: (arg: string) => {},
  description: '',
  setDescription: (arg: string) => {},
  sport: '',
  setSport: (arg: string) => {},
  emotion: '',
  setEmotion: (arg: string) => {},
  isSwitchOn: false,
  setIsSwitchOn: (arg: boolean) => {},
  isDisabled: false,
  setIsDisabled: (arg: boolean) => {},
  images: [],
  setImages: (arg: string[]) => {},
  isLoading: false,
  setIsLoading: (arg: boolean) => {},
});
