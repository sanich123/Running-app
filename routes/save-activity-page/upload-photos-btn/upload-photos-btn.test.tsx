import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/settings/settings';
import { errorToast } from '@S/error-toast/error-toast';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { compressAndSendFile, getAccessToGallery } from '@U/file-sending';
import { UPLOAD_PHOTO_BTN } from './ const';
import UploadPhotosBtn from './upload-photos-btn';

// import * as ImagePicker from 'expo-image-picker';
// import { Image } from 'react-native-compressor';

// import * as auth from '@A/context/utils';
// import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: 'someCompressedString',
  }),
}));
jest.mock('@U/file-sending', () => ({
  getAccessToGallery: jest.fn(),
  compressAndSendFile: jest.fn(),
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));


const originalPlatform = Platform.OS;

describe('Upload photos btn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setUserId('upload-user'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
  });

  it('should correctly renders in english', async () => {
    const setIsDisabled = jest.fn();
    const setImages = jest.fn();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <UploadPhotosBtn
        isDisabled={false}
        setIsDisabled={setIsDisabled}
        setImages={setImages}
        images={[{ url: 'someUrl', thumbnail: null }]}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(UPLOAD_PHOTO_BTN.english.isInitial)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    const setIsDisabled = jest.fn();
    const setImages = jest.fn();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(
      <UploadPhotosBtn
        isDisabled={false}
        setIsDisabled={setIsDisabled}
        setImages={setImages}
        images={[{ url: 'someUrl', thumbnail: null }]}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(UPLOAD_PHOTO_BTN.russian.isInitial)).toBeOnTheScreen();
  });

  it('uploads a selected native image and updates the activity draft', async () => {
    const user = userEvent.setup();
    const setIsDisabled = jest.fn();
    const setImages = jest.fn();
    const uploadedImage = { url: 'https://cdn/photo.jpg', thumbnail: null };
    (getAccessToGallery as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'photo.jpg' }] });
    (compressAndSendFile as jest.Mock).mockResolvedValue(uploadedImage);
    await renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={[]} />,
    );

    await user.press(screen.getByText(UPLOAD_PHOTO_BTN.english.isInitial));
    await waitFor(() => expect(compressAndSendFile).toHaveBeenCalledWith('photo.jpg', 'upload-user'));
    expect(setImages).toHaveBeenCalledWith([uploadedImage]);
    expect(setIsDisabled).toHaveBeenNthCalledWith(1, true);
    expect(setIsDisabled).toHaveBeenLastCalledWith(false);
    expect(mockStore.getState().activity.photoVideoUrls).toContainEqual(uploadedImage);
  });

  it('does nothing for a cancelled selection or a user without an id', async () => {
    const user = userEvent.setup();
    const setImages = jest.fn();
    const setIsDisabled = jest.fn();
    (getAccessToGallery as jest.Mock).mockResolvedValue({ canceled: true, assets: [] });
    await renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={[]} />,
    );
    await user.press(screen.getByText(UPLOAD_PHOTO_BTN.english.isInitial));
    expect(compressAndSendFile).not.toHaveBeenCalled();
    expect(setImages).not.toHaveBeenCalled();

    await act(async () => {
      mockStore.dispatch(setUserId(''));
    });
    (getAccessToGallery as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'photo.jpg' }] });
    await user.press(screen.getByText(UPLOAD_PHOTO_BTN.english.isInitial));
    expect(compressAndSendFile).not.toHaveBeenCalled();
  });

  it('handles a failed gallery request and an upload that returns no file', async () => {
    const user = userEvent.setup();
    const setImages = jest.fn();
    const setIsDisabled = jest.fn();
    (getAccessToGallery as jest.Mock).mockRejectedValue(new Error('gallery failed'));
    await renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={[]} />,
    );
    await user.press(screen.getByText(UPLOAD_PHOTO_BTN.english.isInitial));
    expect(errorToast).toHaveBeenCalledWith('', expect.any(Error));

    (getAccessToGallery as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'photo.jpg' }] });
    (compressAndSendFile as jest.Mock).mockResolvedValue(null);
    await user.press(screen.getByText(UPLOAD_PHOTO_BTN.english.isInitial));
    expect(setImages).not.toHaveBeenCalled();
  });

  it('uses the web file input and appends a successfully uploaded file', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const setImages = jest.fn();
    const setIsDisabled = jest.fn();
    const uploadedImage = { url: 'https://cdn/web.jpg', thumbnail: null };
    (compressAndSendFile as jest.Mock).mockResolvedValue(uploadedImage);
    await renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={[]} />,
    );

    const input = screen.container.queryAll((node) => node.type === 'input')[0];
    await act(async () => {
      await input.props.onChange({ target: { files: [{ name: 'web.jpg' }] } });
    });
    await waitFor(() => expect(compressAndSendFile).toHaveBeenCalledWith({ name: 'web.jpg' }, 'upload-user'));
    expect(setImages).toHaveBeenCalledWith([uploadedImage]);
  });
});
