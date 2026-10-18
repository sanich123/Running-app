import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import * as MediaLibrary from 'expo-media-library';
import { LANGUAGES } from '@const/enums';
import { resetAuthSlice } from '@R/slices/auth/auth';
import { changeLanguage, setSaveCameraPhotosToGallery } from '@R/slices/settings/settings';
import * as errorToastModule from '@S/error-toast/error-toast';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { deleteUploadedMedia } from '@U/file-sending';
import ShotBtn from './shot-btn';
import { uploadActivityMediaBatch } from '../../utils';

jest.mock('expo-media-library', () => ({ Asset: { create: jest.fn().mockResolvedValue({}) } }));
jest.mock('@U/file-sending', () => ({ deleteUploadedMedia: jest.fn().mockResolvedValue(true) }));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
const mockAppendActivityMedia = jest.fn();
jest.mock('@R/services/activity/activity', () => ({
  ...jest.requireActual('@R/services/activity/activity'),
  useAppendActivityMediaMutation: () => [mockAppendActivityMedia],
}));
jest.mock('../../utils', () => ({ uploadActivityMediaBatch: jest.fn() }));

const mockUploadActivityMediaBatch = uploadActivityMediaBatch as jest.Mock;

describe('shot btn', () => {
  beforeEach(() => {
    mockStore.dispatch(resetAuthSlice());
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setSaveCameraPhotosToGallery(false));
    mockUploadActivityMediaBatch.mockReset();
    mockAppendActivityMedia.mockReset();
    (MediaLibrary.Asset.create as jest.Mock).mockReset().mockResolvedValue({});
  });

  it('takes a photo and adds it to preview without saving it to the library by default', async () => {
    const user = userEvent.setup();
    const setPhotos = jest.fn();
    const takePictureAsync = jest.fn().mockResolvedValue({ uri: 'file://new-photo.jpg' });
    await renderWithProviders(
      <ShotBtn cameraRef={{ current: { takePictureAsync } } as any} setPhotos={setPhotos} photos={[]} />,
    );
    await user.press(screen.getByTestId('camera-shot-button'));
    expect(setPhotos).toHaveBeenCalledWith([{ url: 'file://new-photo.jpg', thumbnail: null }]);
    expect(MediaLibrary.Asset.create).not.toHaveBeenCalled();
  });

  it('saves the camera photo to the library when the profile option is enabled', async () => {
    const user = userEvent.setup();
    const takePictureAsync = jest.fn().mockResolvedValue({ uri: 'file://new-photo.jpg' });
    mockStore.dispatch(setSaveCameraPhotosToGallery(true));
    await renderWithProviders(
      <ShotBtn cameraRef={{ current: { takePictureAsync } } as any} setPhotos={jest.fn()} photos={[]} />,
    );

    await user.press(screen.getByTestId('camera-shot-button'));

    expect(MediaLibrary.Asset.create).toHaveBeenCalledWith('file://new-photo.jpg');
  });

  it('uploads a photo for an authenticated user and dispatches it', async () => {
    const user = userEvent.setup();
    const setPhotos = jest.fn();
    mockStore.dispatch(setMockUserId('shot-user'));
    mockUploadActivityMediaBatch.mockResolvedValue([{ url: 'https://cdn.example.com/photo.jpg', thumbnail: 'thumb' }]);
    const takePictureAsync = jest.fn().mockResolvedValue({ uri: 'file://photo.jpg' });
    await renderWithProviders(
      <ShotBtn cameraRef={{ current: { takePictureAsync } } as any} setPhotos={setPhotos} photos={[]} />,
    );

    await user.press(screen.getByTestId('camera-shot-button'));

    expect(mockUploadActivityMediaBatch).toHaveBeenCalledWith(
      [
        {
          fileSrc: 'file://photo.jpg',
          metadata: {
            fileName: expect.stringMatching(/^camera-\d+\.jpg$/),
            mimeType: 'image/jpeg',
            mediaType: 'image',
          },
          mediaId: expect.any(String),
        },
      ],
      expect.objectContaining({ onProgress: expect.any(Function), signal: expect.any(Object) }),
    );
    expect(setPhotos).toHaveBeenCalledWith([{ url: 'https://cdn.example.com/photo.jpg', thumbnail: 'thumb' }]);
    expect(mockStore.getState().activity.media).toContainEqual({
      url: 'https://cdn.example.com/photo.jpg',
      thumbnail: 'thumb',
    });
  });

  it('persists a camera photo to the activity being edited', async () => {
    const user = userEvent.setup();
    const setPhotos = jest.fn();
    mockStore.dispatch(setMockUserId('shot-user'));
    const uploadedPhoto = { url: 'https://temporary/photo.jpg', thumbnail: 'https://temporary/photo-thumb.jpg' };
    const persistedPhoto = { id: 'media-id', activityId: 'activity-id', ...uploadedPhoto };
    mockUploadActivityMediaBatch.mockResolvedValue([uploadedPhoto]);
    mockAppendActivityMedia.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ success: true, media: [persistedPhoto] }),
    });
    const takePictureAsync = jest.fn().mockResolvedValue({ uri: 'file://photo.jpg' });
    await renderWithProviders(
      <ShotBtn
        cameraRef={{ current: { takePictureAsync } } as any}
        setPhotos={setPhotos}
        photos={[]}
        activityId="activity-id"
      />,
    );

    await user.press(screen.getByTestId('camera-shot-button'));

    await waitFor(() => expect(setPhotos).toHaveBeenCalledWith([persistedPhoto]));
    expect(mockAppendActivityMedia).toHaveBeenCalledWith({ id: 'activity-id', media: [uploadedPhoto] });
    expect(deleteUploadedMedia).not.toHaveBeenCalled();
    expect(mockStore.getState().activity.media).toContainEqual(persistedPhoto);
  });

  it('removes the uploaded temporary photo if the server returns no persisted media', async () => {
    const user = userEvent.setup();
    const setPhotos = jest.fn();
    mockStore.dispatch(setMockUserId('shot-user'));
    const uploadedPhoto = { url: 'https://temporary/photo.jpg', thumbnail: null };
    mockUploadActivityMediaBatch.mockResolvedValue([uploadedPhoto]);
    mockAppendActivityMedia.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ success: true, media: [] }) });
    const takePictureAsync = jest.fn().mockResolvedValue({ uri: 'file://photo.jpg' });
    await renderWithProviders(
      <ShotBtn
        cameraRef={{ current: { takePictureAsync } } as any}
        setPhotos={setPhotos}
        photos={[]}
        activityId="activity-id"
      />,
    );

    await user.press(screen.getByTestId('camera-shot-button'));

    await waitFor(() => expect(deleteUploadedMedia).toHaveBeenCalledWith([uploadedPhoto.url]));
    expect(setPhotos).not.toHaveBeenCalled();
    expect(errorToastModule.errorToast).toHaveBeenCalled();
  });

  it('shows upload progress and cancels a camera upload', async () => {
    const user = userEvent.setup();
    const setPhotos = jest.fn();
    let resolveUpload: (value: { url: string; thumbnail: string | null }[]) => void = () => undefined;
    let uploadControl: { onProgress?: (progress: number) => void; signal?: AbortSignal } | undefined;
    mockStore.dispatch(setMockUserId('shot-user'));
    mockUploadActivityMediaBatch.mockImplementation((_mediaItems: unknown, control: typeof uploadControl) => {
      uploadControl = control;
      return new Promise((resolve) => {
        resolveUpload = resolve as typeof resolveUpload;
      });
    });
    const takePictureAsync = jest.fn().mockResolvedValue({ uri: 'file://photo.jpg' });
    await renderWithProviders(
      <ShotBtn cameraRef={{ current: { takePictureAsync } } as any} setPhotos={setPhotos} photos={[]} />,
    );

    await user.press(screen.getByTestId('camera-shot-button'));
    await waitFor(() => expect(screen.getByTestId('camera-upload-progress')).toBeOnTheScreen());
    await act(async () => uploadControl?.onProgress?.(0.65));
    expect(screen.getByTestId('camera-upload-progress').props.accessibilityValue.now).toBe(0.65);

    await user.press(screen.getByTestId('camera-shot-button'));
    expect(uploadControl?.signal?.aborted).toBe(true);
    await act(async () => resolveUpload([{ url: 'https://cdn/photo.jpg', thumbnail: null }]));

    await waitFor(() =>
      expect(screen.getByTestId('camera-shot-button')).toHaveProp('accessibilityLabel', 'Сделать фото'),
    );
    expect(setPhotos).not.toHaveBeenCalled();
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
    expect(noPhoto).toHaveBeenCalled();
    expect(setPhotos).not.toHaveBeenCalled();
    expect(mockUploadActivityMediaBatch).not.toHaveBeenCalled();
  });

  it('keeps the existing photos when upload returns nothing', async () => {
    const user = userEvent.setup();
    const setPhotos = jest.fn();
    mockStore.dispatch(setMockUserId('shot-user'));
    mockUploadActivityMediaBatch.mockResolvedValue([null]);
    const takePictureAsync = jest.fn().mockResolvedValue({ uri: 'file://photo.jpg' });
    await renderWithProviders(
      <ShotBtn cameraRef={{ current: { takePictureAsync } } as any} setPhotos={setPhotos} photos={[]} />,
    );

    await user.press(screen.getByTestId('camera-shot-button'));

    expect(setPhotos).not.toHaveBeenCalled();
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
