import { screen } from '@testing-library/react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { Image } from 'react-native-compressor';

import UploadPhotosBtn from './upload-photos-btn';
// import * as auth from '../../auth/context/auth-context';
// import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: 'someCompressedString',
  }),
}));

describe('Upload photos btn', () => {
  it('should correctly renders', () => {
    const setIsDisabled = jest.fn();
    renderWithProviders(<UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} />, { store: mockStore });
    expect(screen.getByText('Upload an image')).toBeOnTheScreen();
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
