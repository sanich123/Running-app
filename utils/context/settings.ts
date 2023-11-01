import { createContext } from 'react';

export const SaveSettingsContext = createContext({
  gender: '',
  name: '',
  surname: '',
  city: '',
  weight: '',
  bio: '',
  photoUrl: '',
  image: null,
  isDisabled: false,
  isLoading: false,
  setIsDisabled: (arg: boolean) => {},
  setGender: (arg: string) => {},
  setName: (arg: string) => {},
  setSurname: (arg: string) => {},
  setCity: (arg: string) => {},
  setWeight: (arg: string) => {},
  setBio: (arg: string) => {},
  setImage: (arg: string) => {},
  setIsLoading: (arg: boolean) => {},
  setPhotoUrl: (arg: string) => {},
});
