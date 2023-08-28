import { createContext } from 'react';

export const SaveSettingsContext = createContext({
  gender: '',
  sport: '',
  name: '',
  surname: '',
  city: '',
  weight: '',
  bio: '',
  inputDate: undefined || new Date(),
  image: null,
  isDisabled: false,
  setIsDisabled: (arg: boolean) => {},
  setGender: (arg: string) => {},
  setSport: (arg: string) => {},
  setName: (arg: string) => {},
  setSurname: (arg: string) => {},
  setCity: (arg: string) => {},
  setWeight: (arg: string) => {},
  setBio: (arg: string) => {},
  setInputDate: (arg: Date) => {},
  setImage: (arg: string) => {},
});
