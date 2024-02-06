import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { UPLOAD_PHOTO_BTN } from './ const';
import UploadPhotosBtn from './upload-photos-btn';

// import * as ImagePicker from 'expo-image-picker';
// import { Image } from 'react-native-compressor';

// import * as auth from '../../auth/context/auth-context';
// import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: 'someCompressedString',
  }),
}));
jest.mock('@A/supabase/supabase-init', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  },
}));
describe('Upload photos btn', () => {
  it('should correctly renders in english', () => {
    const setIsDisabled = jest.fn();
    const setImages = jest.fn();
    renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={['someUrl']} />,
      { store: mockStore },
    );
    expect(screen.getByText(UPLOAD_PHOTO_BTN.english.isInitial)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', () => {
    const setIsDisabled = jest.fn();
    const setImages = jest.fn();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={['someUrl']} />,
      { store: mockStore },
    );
    expect(screen.getByText(UPLOAD_PHOTO_BTN.russian.isInitial)).toBeOnTheScreen();
  });
  // it('should correctly interract with the user', async () => {
  //   jest.spyOn(ImagePicker, 'launchImageLibraryAsync').mockImplementation(() =>
  //     Promise.resolve({
  //       assets: [{ uri: 'someUri', width: 150, height: 150 }],
  //       canceled: false,
  //     }),
  //   );
  //   jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
  //     user: {
  //       id: 'someUserId',
  //       ...USER_AUTH_MOCKS,
  //     },
  //   }));
  //   // jest.spyOn(Image, 'compress').mockImplementation(() => Promise.resolve('someCompressedString'));
  //   const setIsDisabled = jest.fn();
  //   renderWithProviders(<UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} />, { store: mockStore });
  //   const uploadBtn = screen.getByText('Upload an image');
  //   await userEvent.press(uploadBtn);
  //   expect(setIsDisabled).toHaveBeenCalled();
  // });
});
