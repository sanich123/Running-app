import { screen, userEvent, waitFor } from '@testing-library/react-native';
import * as MediaLibrary from 'expo-media-library';
import { setUserId, resetAuthSlice } from '@R/slices/auth/auth';
import * as errorToastModule from '@S/error-toast/error-toast';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { compressAndSendFile } from '@U/file-sending';
import ShotBtn from './shot-btn';

jest.mock('expo-media-library', () => ({ Asset: { create: jest.fn() } }));
jest.mock('@U/file-sending', () => ({ compressAndSendFile: jest.fn() }));

const mockCompressAndSendFile = compressAndSendFile as jest.Mock;

describe('shot btn', () => {
  beforeEach(() => {
    mockStore.dispatch(resetAuthSlice());
    mockCompressAndSendFile.mockReset();
  });

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

  it('uploads a photo for an authenticated user and dispatches it', async () => {
    const user = userEvent.setup();
    const setPhotos = jest.fn();
    mockStore.dispatch(setUserId('shot-user'));
    mockCompressAndSendFile.mockResolvedValue({ url: 'https://cdn.example.com/photo.jpg', thumbnail: 'thumb' });
    const takePictureAsync = jest.fn().mockResolvedValue({ uri: 'file://photo.jpg' });
    await renderWithProviders(
      <ShotBtn cameraRef={{ current: { takePictureAsync } } as any} setPhotos={setPhotos} photos={[]} />,
    );

    await user.press(screen.getByTestId('camera-shot-button'));

    expect(mockCompressAndSendFile).toHaveBeenCalledWith('file://photo.jpg', 'shot-user');
    expect(setPhotos).toHaveBeenCalledWith([{ url: 'https://cdn.example.com/photo.jpg', thumbnail: 'thumb' }]);
    expect(mockStore.getState().activity.photoVideoUrls).toContainEqual({
      url: 'https://cdn.example.com/photo.jpg',
      thumbnail: 'thumb',
    });
  });

  it('does nothing when there is no camera', async () => {
    const user = userEvent.setup();
    const setPhotos = jest.fn();
    await renderWithProviders(<ShotBtn cameraRef={{ current: null } as any} setPhotos={setPhotos} photos={[]} />);
    await user.press(screen.getByTestId('camera-shot-button'));
    expect(setPhotos).not.toHaveBeenCalled();
  });

  it('does nothing when the camera returns no photo', async () => {
    const user = userEvent.setup();
    const setPhotos = jest.fn();
    const noPhoto = jest.fn().mockResolvedValue(null);
    await renderWithProviders(
      <ShotBtn cameraRef={{ current: { takePictureAsync: noPhoto } } as any} setPhotos={setPhotos} photos={[]} />,
    );
    await user.press(screen.getByTestId('camera-shot-button'));
    expect(MediaLibrary.Asset.create).not.toHaveBeenCalledWith(undefined);
  });

  it('keeps the existing photos when upload returns nothing', async () => {
    const user = userEvent.setup();
    const setPhotos = jest.fn();
    mockStore.dispatch(setUserId('shot-user'));
    mockCompressAndSendFile.mockResolvedValue(null);
    const takePictureAsync = jest.fn().mockResolvedValue({ uri: 'file://photo.jpg' });
    await renderWithProviders(
      <ShotBtn cameraRef={{ current: { takePictureAsync } } as any} setPhotos={setPhotos} photos={[]} />,
    );

    await user.press(screen.getByTestId('camera-shot-button'));

    expect(setPhotos).not.toHaveBeenCalled();
    expect(MediaLibrary.Asset.create).toHaveBeenCalledWith('file://photo.jpg');
  });

  it('reports camera errors and finishes the loading state', async () => {
    const user = userEvent.setup();
    const error = new Error('camera failed');
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    const takePictureAsync = jest.fn().mockRejectedValue(error);
    await renderWithProviders(
      <ShotBtn cameraRef={{ current: { takePictureAsync } } as any} setPhotos={jest.fn()} photos={[]} />,
    );

    await user.press(screen.getByTestId('camera-shot-button'));

    await waitFor(() => expect(errorToast).toHaveBeenCalledWith('', error));
    expect(screen.queryByTestId('camera-shot-button')).toBeOnTheScreen();
  });
});
