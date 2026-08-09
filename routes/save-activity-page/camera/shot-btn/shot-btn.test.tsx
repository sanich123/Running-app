import { screen, userEvent } from '@testing-library/react-native';
import * as MediaLibrary from 'expo-media-library';
import { renderWithProviders } from '@T/utils/test-utils';
import ShotBtn from './shot-btn';

jest.mock('expo-media-library', () => ({ Asset: { create: jest.fn() } }));

describe('shot btn', () => {
  it('takes a photo, adds it to preview and saves it to the library', async () => {
    const user = userEvent.setup();
    const setPhotos = jest.fn();
    const takePictureAsync = jest.fn().mockResolvedValue({ uri: 'file://new-photo.jpg' });
    await renderWithProviders(
      <ShotBtn cameraRef={{ current: { takePictureAsync } } as any} setPhotos={setPhotos} photos={[]} />,
    );
    await user.press(screen.getByTestId('camera-shot-button'));
    expect(setPhotos).toHaveBeenCalledWith([{ url: 'file://new-photo.jpg', thumbnail: null }]);
    expect(MediaLibrary.Asset.create).toHaveBeenCalledWith('file://new-photo.jpg');
  });
});
