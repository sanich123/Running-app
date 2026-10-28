import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ProfileAvatarTestIds } from '@Routes/profile/avatar/profile-avatar/const';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { compressMediaFile, getAccessToGallery, uploadMediaFile } from '@U/file-sending';
import { ProfileAvatarEditorTestIds } from './const';
import ProfileAvatarEditor from './profile-avatar-editor';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
jest.mock('@U/file-sending', () => {
  const { TEST_URLS } = jest.requireActual<{
    TEST_URLS: { imageAvatar: string; avatarFileUri: string };
  }>('@T/mocks/const');
  return {
    getAccessToGallery: jest.fn(() => Promise.resolve({ canceled: false, assets: [{ uri: TEST_URLS.avatarFileUri }] })),
    compressMediaFile: jest.fn(() =>
      Promise.resolve({
        file: 'compressed-avatar.jpg',
        originalName: 'avatar.jpg',
        extension: 'jpg',
        isVideo: false,
        mimeType: 'image/jpeg',
      }),
    ),
    uploadMediaFile: jest.fn(() =>
      Promise.resolve({ url: TEST_URLS.imageAvatar, key: 'avatar.jpg', contentType: 'image/jpeg' }),
    ),
  };
});

let userNumber = 0;
function setupProfile(profilePhoto: string | null) {
  const userId = `avatar-user-${(userNumber += 1)}`;
  mockStore.dispatch(setMockUserId(userId));
  server.use(
    http.get(`${BASE_URL}/user/${userId}/profile`, () => HttpResponse.json({ ...MOCK_PROFILE, userId, profilePhoto })),
  );
  return userId;
}

describe('Profile avatar editor', () => {
  it('should correctly renders', async () => {
    setupProfile(null);
    await renderWithProviders(<ProfileAvatarEditor setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });
    expect(screen.getByTestId(ProfileAvatarEditorTestIds.editButton)).toBeOnTheScreen();
    expect(screen.getByTestId(ProfileAvatarEditorTestIds.editIcon)).toBeOnTheScreen();
  });

  it('should renders an image, when profile has an image url', async () => {
    setupProfile(MOCK_PROFILE.profilePhoto);
    await renderWithProviders(<ProfileAvatarEditor setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });
    const img = await screen.findByTestId(ProfileAvatarTestIds.image);
    expect(img.props.source.uri).toEqual(MOCK_PROFILE.profilePhoto);
  });

  it('should renders a default icon, when there is no image url in profile', async () => {
    setupProfile(null);
    await renderWithProviders(<ProfileAvatarEditor setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });
    expect(await screen.findByTestId(ProfileAvatarTestIds.defaultIcon)).toBeOnTheScreen();
  });

  it('should be disabled, when isDisabled', async () => {
    setupProfile(null);
    await renderWithProviders(<ProfileAvatarEditor setIsDisabled={jest.fn()} isDisabled />, { store: mockStore });
    expect(screen.getByTestId(ProfileAvatarEditorTestIds.editButton)).toBeDisabled();
  });

  it('should show a loader while the avatar is uploading', async () => {
    setupProfile(null);
    await renderWithProviders(<ProfileAvatarEditor setIsDisabled={jest.fn()} isDisabled />, { store: mockStore });
    expect(screen.getByTestId(ProfileAvatarEditorTestIds.loadingOverlay)).toBeOnTheScreen();
  });

  it('does not save the profile photo when upload returns a URL without a moderation asset id', async () => {
    const user = userEvent.setup();
    const setIsDisabled = jest.fn();
    const userId = setupProfile(MOCK_PROFILE.profilePhoto);
    let requestBody: unknown;
    server.use(
      http.patch(`${BASE_URL}/user/${userId}/profile`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ ...MOCK_PROFILE, userId });
      }),
    );

    await renderWithProviders(<ProfileAvatarEditor setIsDisabled={setIsDisabled} isDisabled={false} />);
    await user.press(await screen.findByTestId(ProfileAvatarEditorTestIds.editButton));

    await waitFor(() => expect(uploadMediaFile).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId(ProfileAvatarEditorTestIds.editButton)).toBeEnabled());
    expect(requestBody).toBeUndefined();
    expect(screen.getByTestId(ProfileAvatarTestIds.image).props.source.uri).toBe(MOCK_PROFILE.profilePhoto);
    expect(setIsDisabled).toHaveBeenNthCalledWith(1, true);
    expect(setIsDisabled).toHaveBeenLastCalledWith(false);
  });

  it('links a pending avatar immediately and keeps the owner preview visible', async () => {
    const user = userEvent.setup();
    const userId = setupProfile(MOCK_PROFILE.profilePhoto);
    const previewPhoto = 'https://images.example.test/pending-avatar-preview.jpg';
    const pendingBlurhash = 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH';
    let requestBody: unknown;
    let currentPhoto = MOCK_PROFILE.profilePhoto;
    let currentBlurhash = MOCK_PROFILE.profilePhotoBlurhash;
    (uploadMediaFile as jest.Mock).mockResolvedValueOnce({
      assetId: 'avatar-asset',
      status: 'queued',
      blurhash: pendingBlurhash,
      contentType: 'image/jpeg',
    });
    server.use(
      http.get(`${BASE_URL}/user/${userId}/profile`, () =>
        HttpResponse.json({
          ...MOCK_PROFILE,
          userId,
          profilePhoto: currentPhoto,
          profilePhotoBlurhash: currentBlurhash,
          profilePhotoReviewStatus: currentPhoto === previewPhoto ? 'queued' : null,
        }),
      ),
      http.patch(`${BASE_URL}/user/${userId}/profile`, async ({ request }) => {
        requestBody = await request.json();
        currentPhoto = previewPhoto;
        currentBlurhash = pendingBlurhash;
        return HttpResponse.json({
          ...MOCK_PROFILE,
          userId,
          profilePhoto: previewPhoto,
          profilePhotoBlurhash: pendingBlurhash,
          profilePhotoReviewStatus: 'queued',
        });
      }),
    );

    await renderWithProviders(<ProfileAvatarEditor setIsDisabled={jest.fn()} isDisabled={false} />);
    await user.press(await screen.findByTestId(ProfileAvatarEditorTestIds.editButton));

    await waitFor(() =>
      expect(requestBody).toEqual({ profilePhotoAssetId: 'avatar-asset', profilePhotoBlurhash: pendingBlurhash }),
    );
    await waitFor(() => expect(screen.getByTestId(ProfileAvatarTestIds.image).props.source.uri).toBe(previewPhoto));
    expect(screen.getByTestId(ProfileAvatarEditorTestIds.editButton)).toBeEnabled();
  });

  it.each([
    ['cancelled', { canceled: true, assets: [] }],
    ['without assets', { canceled: false, assets: [] }],
    ['without an asset URI', { canceled: false, assets: [{ uri: '' }] }],
  ])('does not upload when the gallery result is %s', async (_description, result) => {
    setupProfile(null);
    (getAccessToGallery as jest.Mock).mockResolvedValueOnce(result);
    await renderWithProviders(<ProfileAvatarEditor setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });

    await userEvent.setup().press(await screen.findByTestId(ProfileAvatarEditorTestIds.editButton));

    expect(compressMediaFile).not.toHaveBeenCalled();
    expect(uploadMediaFile).not.toHaveBeenCalled();
  });

  it.each([
    ['rejected by compression', null],
    [
      'identified as video',
      {
        file: 'compressed-video.mp4',
        originalName: 'avatar.mp4',
        extension: 'mp4',
        isVideo: true,
        mimeType: 'video/mp4',
      },
    ],
  ])('stops before upload when the selected avatar is %s', async (_description, compressedMedia) => {
    setupProfile(null);
    (compressMediaFile as jest.Mock).mockResolvedValueOnce(compressedMedia);
    await renderWithProviders(<ProfileAvatarEditor setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });

    await userEvent.setup().press(await screen.findByTestId(ProfileAvatarEditorTestIds.editButton));

    await waitFor(() => expect(compressMediaFile).toHaveBeenCalled());
    expect(uploadMediaFile).not.toHaveBeenCalled();
  });

  it('stops before updating when the media upload returns no photo', async () => {
    setupProfile(null);
    (uploadMediaFile as jest.Mock).mockResolvedValueOnce(null);
    const setIsDisabled = jest.fn();
    await renderWithProviders(<ProfileAvatarEditor setIsDisabled={setIsDisabled} isDisabled={false} />, {
      store: mockStore,
    });

    await userEvent.setup().press(await screen.findByTestId(ProfileAvatarEditorTestIds.editButton));

    await waitFor(() => expect(uploadMediaFile).toHaveBeenCalled());
    expect(setIsDisabled).toHaveBeenLastCalledWith(false);
  });

  it('skips the upload when the account has no user id', async () => {
    mockStore.dispatch(setMockUserId(''));
    await renderWithProviders(<ProfileAvatarEditor setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });

    await userEvent.setup().press(screen.getByTestId(ProfileAvatarEditorTestIds.editButton));

    expect(getAccessToGallery).toHaveBeenCalledWith(['images']);
    expect(compressMediaFile).not.toHaveBeenCalled();
    expect(uploadMediaFile).not.toHaveBeenCalled();
  });

  it('stops after compression when the user cancels the avatar upload', async () => {
    const user = userEvent.setup();
    setupProfile(null);
    let resolveCompression: (value: Awaited<ReturnType<typeof compressMediaFile>>) => void = () => undefined;
    (compressMediaFile as jest.Mock).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCompression = resolve;
      }),
    );
    await renderWithProviders(<ProfileAvatarEditor setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });

    await user.press(await screen.findByTestId(ProfileAvatarEditorTestIds.editButton));
    await user.press(await screen.findByTestId(ProfileAvatarEditorTestIds.loadingOverlay));
    await act(async () => {
      resolveCompression({
        file: 'compressed-avatar.jpg',
        originalName: 'avatar.jpg',
        extension: 'jpg',
        isVideo: false,
        mimeType: 'image/jpeg',
      });
    });

    await waitFor(() => expect(screen.queryByTestId(ProfileAvatarEditorTestIds.loadingOverlay)).toBeNull());
    expect(uploadMediaFile).not.toHaveBeenCalled();
  });
});
