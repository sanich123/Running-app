import { createContext } from 'react';

export const SaveSettingsContext = createContext({
  gender: '',
  sport: '',
  name: '',
  surname: '',
  city: '',
  weight: '',
  bio: '',
  birthday: undefined,
  image: null,
  isDisabled: false,
  isLoading: false,
  setIsDisabled: (arg: boolean) => {},
  setGender: (arg: string) => {},
  setSport: (arg: string) => {},
  setName: (arg: string) => {},
  setSurname: (arg: string) => {},
  setCity: (arg: string) => {},
  setWeight: (arg: string) => {},
  setBio: (arg: string) => {},
  setBirthday: (arg: Date) => {},
  setImage: (arg: string) => {},
  setIsLoading: (arg: boolean) => {},
});