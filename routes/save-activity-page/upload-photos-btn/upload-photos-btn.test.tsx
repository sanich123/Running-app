import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { errorToast } from '@S/error-toast/error-toast';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { deleteUploadedMedia, getAccessToGallery } from '@U/file-sending';
import { uploadActivityMediaBatch } from '../utils';
import { MAX_ACTIVITY_MEDIA } from './ const';
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
  deleteUploadedMedia: jest.fn().mockResolvedValue(true),
}));
const mockAppendActivityMedia = jest.fn();
jest.mock('@R/services/activity/activity', () => ({
  ...jest.requireActual('@R/services/activity/activity'),
  useAppendActivityMediaMutation: () => [mockAppendActivityMedia],
}));
jest.mock('../utils', () => ({ uploadActivityMediaBatch: jest.fn() }));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));

const originalPlatform = Platform.OS;

describe('Upload photos btn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppendActivityMedia.mockReset();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setMockUserId('upload-user'));
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
    expect(screen.getByTestId('upload-gallery-button')).toBeOnTheScreen();
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
    expect(screen.getByTestId('upload-gallery-button')).toBeOnTheScreen();
  });

  it('uploads a selected native image and updates the activity draft', async () => {
    const user = userEvent.setup();
    const setIsDisabled = jest.fn();
    const setImages = jest.fn();
    const uploadedImage = { url: 'https://cdn/photo.jpg', thumbnail: null };
    (getAccessToGallery as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'photo.jpg', fileName: 'photo.jpg', mimeType: 'image/jpeg' }],
    });
    (uploadActivityMediaBatch as jest.Mock).mockResolvedValue([uploadedImage]);
    await renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={[]} />,
    );

    await user.press(screen.getByTestId('upload-gallery-button'));
    expect(getAccessToGallery).toHaveBeenCalledWith(['images', 'videos'], {
      allowsMultipleSelection: true,
      selectionLimit: MAX_ACTIVITY_MEDIA,
    });
    await waitFor(() =>
      expect(uploadActivityMediaBatch).toHaveBeenCalledWith(
        [
          {
            fileSrc: 'photo.jpg',
            metadata: { fileName: 'photo.jpg', mimeType: 'image/jpeg', mediaType: 'image' },
            mediaId: expect.any(String),
          },
        ],
        expect.objectContaining({ onProgress: expect.any(Function), signal: expect.any(Object) }),
      ),
    );
    expect(setImages).toHaveBeenCalledWith([uploadedImage]);
    expect(setIsDisabled).toHaveBeenNthCalledWith(1, true);
    expect(setIsDisabled).toHaveBeenLastCalledWith(false);
    expect(mockStore.getState().activity.media).toContainEqual(uploadedImage);
  });

  it('marks media processing as active until compression and upload finish', async () => {
    const user = userEvent.setup();
    const setIsDisabled = jest.fn();
    const setImages = jest.fn();
    let wasProcessingActiveDuringUpload = false;
    (getAccessToGallery as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'photo.jpg', fileName: 'photo.jpg', mimeType: 'image/jpeg' }],
    });
    (uploadActivityMediaBatch as jest.Mock).mockImplementation(async () => {
      wasProcessingActiveDuringUpload = mockStore.getState().activity.activeMediaUploadCount > 0;
      return [{ url: 'https://cdn/photo.jpg', thumbnail: null }];
    });
    await renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={[]} />,
      { store: mockStore },
    );

    await user.press(screen.getByTestId('upload-gallery-button'));
    await waitFor(() => expect(uploadActivityMediaBatch).toHaveBeenCalled());
    await waitFor(() => expect(mockStore.getState().activity.activeMediaUploadCount).toBe(0));
    expect(wasProcessingActiveDuringUpload).toBe(true);
  });

  it('preserves a selected video as video media during upload', async () => {
    const user = userEvent.setup();
    const setIsDisabled = jest.fn();
    const setImages = jest.fn();
    const uploadedVideo = { url: 'https://cdn/workout.mp4', thumbnail: 'https://cdn/workout.jpg' };
    (getAccessToGallery as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'workout.mp4', fileName: 'workout.mp4', mimeType: 'video/mp4', type: 'video' }],
    });
    (uploadActivityMediaBatch as jest.Mock).mockResolvedValue([uploadedVideo]);
    await renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={[]} />,
    );

    await user.press(screen.getByTestId('upload-gallery-button'));

    await waitFor(() => expect(uploadActivityMediaBatch).toHaveBeenCalledTimes(1));
    expect(uploadActivityMediaBatch).toHaveBeenCalledWith(
      [
        {
          fileSrc: 'workout.mp4',
          metadata: { fileName: 'workout.mp4', mimeType: 'video/mp4', mediaType: 'video' },
          mediaId: expect.any(String),
        },
      ],
      expect.objectContaining({ onProgress: expect.any(Function), signal: expect.any(Object) }),
    );
    expect(setImages).toHaveBeenCalledWith([uploadedVideo]);
  });

  it('shows upload progress and cancels without appending the media', async () => {
    const user = userEvent.setup();
    const setIsDisabled = jest.fn();
    const setImages = jest.fn();
    const uploadedImage = { url: 'https://cdn/photo.jpg', thumbnail: null };
    let resolveUpload: (value: (typeof uploadedImage)[]) => void = () => undefined;
    let uploadControl: { onProgress?: (progress: number) => void; signal?: AbortSignal } | undefined;
    (getAccessToGallery as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'photo.jpg', fileName: 'photo.jpg', mimeType: 'image/jpeg' }],
    });
    (uploadActivityMediaBatch as jest.Mock).mockImplementation(
      (_mediaItems: unknown, control: typeof uploadControl) => {
        uploadControl = control;
        return new Promise((resolve) => {
          resolveUpload = resolve as typeof resolveUpload;
        });
      },
    );
    await renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={[]} />,
    );

    await user.press(screen.getByTestId('upload-gallery-button'));
    await waitFor(() => expect(screen.getByTestId('cancel-gallery-upload-button')).toBeOnTheScreen());
    await act(async () => uploadControl?.onProgress?.(0.42));
    expect(screen.getByTestId('gallery-upload-progress').props.accessibilityValue.now).toBe(0.42);

    await user.press(screen.getByTestId('cancel-gallery-upload-button'));
    expect(uploadControl?.signal?.aborted).toBe(true);
    await act(async () => resolveUpload([uploadedImage]));

    await waitFor(() => expect(screen.getByTestId('upload-gallery-button')).toBeOnTheScreen());
    expect(setImages).not.toHaveBeenCalled();
  });

  it('uploads several selected native files and keeps the selected order', async () => {
    const user = userEvent.setup();
    const setIsDisabled = jest.fn();
    const setImages = jest.fn();
    const uploadedImages = [
      { url: 'https://cdn/photo-1.jpg', thumbnail: null },
      { url: 'https://cdn/photo-2.jpg', thumbnail: null },
      { url: 'https://cdn/photo-3.jpg', thumbnail: null },
    ];
    (getAccessToGallery as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [
        { uri: 'photo-1.jpg', fileName: 'photo-1.jpg', mimeType: 'image/jpeg' },
        { uri: 'photo-2.jpg', fileName: 'photo-2.jpg', mimeType: 'image/jpeg' },
        { uri: 'photo-3.jpg', fileName: 'photo-3.jpg', mimeType: 'image/jpeg' },
      ],
    });
    (uploadActivityMediaBatch as jest.Mock).mockResolvedValue(uploadedImages);
    await renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={[]} />,
    );

    await user.press(screen.getByTestId('upload-gallery-button'));

    await waitFor(() => expect(uploadActivityMediaBatch).toHaveBeenCalledTimes(1));
    expect(setImages).toHaveBeenCalledWith(uploadedImages);
    expect(mockStore.getState().activity.media.slice(0, 3)).toEqual(uploadedImages);
  });

  it('does not select more files than the remaining activity media slots', async () => {
    const user = userEvent.setup();
    const setIsDisabled = jest.fn();
    const setImages = jest.fn();
    const existingImages = Array.from({ length: MAX_ACTIVITY_MEDIA - 1 }, (_, index) => ({
      url: `https://cdn/existing-${index}.jpg`,
      thumbnail: null,
    }));
    (getAccessToGallery as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [
        { uri: 'photo-1.jpg', fileName: 'photo-1.jpg', mimeType: 'image/jpeg' },
        { uri: 'photo-2.jpg', fileName: 'photo-2.jpg', mimeType: 'image/jpeg' },
      ],
    });
    (uploadActivityMediaBatch as jest.Mock).mockResolvedValue([{ url: 'https://cdn/photo-1.jpg', thumbnail: null }]);
    await renderWithProviders(
      <UploadPhotosBtn
        isDisabled={false}
        setIsDisabled={setIsDisabled}
        setImages={setImages}
        images={existingImages}
      />,
    );

    await user.press(screen.getByTestId('upload-gallery-button'));

    expect(getAccessToGallery).toHaveBeenCalledWith(['images', 'videos'], {
      allowsMultipleSelection: true,
      selectionLimit: 1,
    });
    await waitFor(() => expect(uploadActivityMediaBatch).toHaveBeenCalledTimes(1));
    expect(uploadActivityMediaBatch).toHaveBeenCalledWith(
      [
        {
          fileSrc: 'photo-1.jpg',
          metadata: { fileName: 'photo-1.jpg', mimeType: 'image/jpeg', mediaType: 'image' },
          mediaId: expect.any(String),
        },
      ],
      expect.objectContaining({ onProgress: expect.any(Function), signal: expect.any(Object) }),
    );
  });

  it('persists media to the edited activity and keeps the returned media id', async () => {
    const user = userEvent.setup();
    const setImages = jest.fn();
    const uploadedMedia = { url: 'https://temporary/photo.jpg', thumbnail: null };
    const persistedMedia = { id: 'media-id', activityId: 'activity-id', ...uploadedMedia };
    (getAccessToGallery as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'photo.jpg', fileName: 'photo.jpg', mimeType: 'image/jpeg' }],
    });
    (uploadActivityMediaBatch as jest.Mock).mockResolvedValue([uploadedMedia]);
    mockAppendActivityMedia.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ success: true, media: [persistedMedia] }),
    });
    await renderWithProviders(
      <UploadPhotosBtn
        isDisabled={false}
        setIsDisabled={jest.fn()}
        setImages={setImages}
        images={[]}
        activityId="activity-id"
      />,
    );

    await user.press(screen.getByTestId('upload-gallery-button'));

    await waitFor(() => expect(setImages).toHaveBeenCalledWith([persistedMedia]));
    expect(mockAppendActivityMedia).toHaveBeenCalledWith({ id: 'activity-id', media: [uploadedMedia] });
    expect(deleteUploadedMedia).not.toHaveBeenCalled();
    expect(mockStore.getState().activity.media).toContainEqual(persistedMedia);
  });

  it('cleans up uploaded temporary files when the activity append fails', async () => {
    const user = userEvent.setup();
    const setImages = jest.fn();
    const uploadedMedia = { url: 'https://temporary/photo.jpg', thumbnail: 'https://temporary/thumb.jpg' };
    (getAccessToGallery as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'photo.jpg', fileName: 'photo.jpg', mimeType: 'image/jpeg' }],
    });
    (uploadActivityMediaBatch as jest.Mock).mockResolvedValue([uploadedMedia]);
    mockAppendActivityMedia.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('append failed')) });
    await renderWithProviders(
      <UploadPhotosBtn
        isDisabled={false}
        setIsDisabled={jest.fn()}
        setImages={setImages}
        images={[]}
        activityId="activity-id"
      />,
    );

    await user.press(screen.getByTestId('upload-gallery-button'));

    await waitFor(() =>
      expect(deleteUploadedMedia).toHaveBeenCalledWith([uploadedMedia.url, uploadedMedia.thumbnail], []),
    );
    expect(setImages).not.toHaveBeenCalled();
    expect(mockStore.getState().activity.media).not.toContainEqual(uploadedMedia);
    expect(errorToast).toHaveBeenCalled();
  });

  it('does nothing for a cancelled selection or a user without an id', async () => {
    const user = userEvent.setup();
    const setImages = jest.fn();
    const setIsDisabled = jest.fn();
    (getAccessToGallery as jest.Mock).mockResolvedValue({ canceled: true, assets: [] });
    await renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={[]} />,
    );
    await user.press(screen.getByTestId('upload-gallery-button'));
    expect(uploadActivityMediaBatch).not.toHaveBeenCalled();
    expect(setImages).not.toHaveBeenCalled();

    await act(async () => {
      mockStore.dispatch(setMockUserId(''));
    });
    (getAccessToGallery as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'photo.jpg' }] });
    await user.press(screen.getByTestId('upload-gallery-button'));
    expect(uploadActivityMediaBatch).not.toHaveBeenCalled();
  });

  it('handles a failed gallery request and an upload that returns no file', async () => {
    const user = userEvent.setup();
    const setImages = jest.fn();
    const setIsDisabled = jest.fn();
    (getAccessToGallery as jest.Mock).mockRejectedValue(new Error('gallery failed'));
    await renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={[]} />,
    );
    await user.press(screen.getByTestId('upload-gallery-button'));
    expect(errorToast).toHaveBeenCalledWith('', expect.any(Error));

    (getAccessToGallery as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'photo.jpg' }] });
    (uploadActivityMediaBatch as jest.Mock).mockResolvedValue([null]);
    await user.press(screen.getByTestId('upload-gallery-button'));
    expect(setImages).not.toHaveBeenCalled();
  });

  it('uses the web file input and appends a successfully uploaded file', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const setImages = jest.fn();
    const setIsDisabled = jest.fn();
    const uploadedImages = [
      { url: 'https://cdn/web-1.jpg', thumbnail: null },
      { url: 'https://cdn/web-2.jpg', thumbnail: null },
    ];
    (uploadActivityMediaBatch as jest.Mock).mockResolvedValue(uploadedImages);
    await renderWithProviders(
      <UploadPhotosBtn isDisabled={false} setIsDisabled={setIsDisabled} setImages={setImages} images={[]} />,
    );

    const input = screen.container.queryAll((node) => node.type === 'input')[0];
    await act(async () => {
      await input.props.onChange({
        target: {
          files: [
            { name: 'web-1.jpg', type: 'image/jpeg' },
            { name: 'web-2.jpg', type: 'image/jpeg' },
          ],
        },
      });
    });
    expect(input.props.multiple).toBe(true);
    await waitFor(() => expect(uploadActivityMediaBatch).toHaveBeenCalledTimes(1));
    expect(uploadActivityMediaBatch).toHaveBeenCalledWith(
      [
        {
          fileSrc: { name: 'web-1.jpg', type: 'image/jpeg' },
          metadata: { fileName: 'web-1.jpg', mimeType: 'image/jpeg', mediaType: 'image' },
          mediaId: expect.any(String),
        },
        {
          fileSrc: { name: 'web-2.jpg', type: 'image/jpeg' },
          metadata: { fileName: 'web-2.jpg', mimeType: 'image/jpeg', mediaType: 'image' },
          mediaId: expect.any(String),
        },
      ],
      expect.objectContaining({ onProgress: expect.any(Function), signal: expect.any(Object) }),
    );
    expect(setImages).toHaveBeenCalledWith(uploadedImages);
  });
});
