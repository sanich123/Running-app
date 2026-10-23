import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { compressMediaFile, getAccessToGallery, uploadMediaFile, waitForMediaUploadReview } from '@U/file-sending';
import { AvatarEditableTestIds } from '../const';
import AvatarIconEditable from './avatar-icon-editable';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
jest.mock('@U/file-sending', () => ({
  getAccessToGallery: jest.fn(() => Promise.resolve({ canceled: false, assets: [{ uri: 'file://avatar.jpg' }] })),
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
    Promise.resolve({ url: 'https://images.example.test/avatar.jpg', key: 'avatar.jpg', contentType: 'image/jpeg' }),
  ),
  waitForMediaUploadReview: jest.fn((uploads) => Promise.resolve(uploads)),
}));

let userNumber = 0;
function setupProfile(profilePhoto: string | null) {
  const userId = `avatar-user-${(userNumber += 1)}`;
  mockStore.dispatch(setMockUserId(userId));
  server.use(
    http.get(`${BASE_URL}/user/${userId}/profile`, () => HttpResponse.json({ ...MOCK_PROFILE, userId, profilePhoto })),
  );
  return userId;
}

describe('Avatar icon editable', () => {
  it('should correctly renders', async () => {
    setupProfile(null);
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeOnTheScreen();
    expect(screen.getByTestId(AvatarEditableTestIds.editIcon)).toBeOnTheScreen();
  });

  it('should renders an image, when profile has an image url', async () => {
    setupProfile(MOCK_PROFILE.profilePhoto);
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });
    const img = await screen.findByTestId(AvatarEditableTestIds.successImg);
    expect(img.props.source.uri).toEqual(MOCK_PROFILE.profilePhoto);
  });

  it('should renders a default icon, when there is no image url in profile', async () => {
    setupProfile(null);
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });
    expect(await screen.findByTestId(AvatarEditableTestIds.default)).toBeOnTheScreen();
  });

  it('should be disabled, when isDisabled', async () => {
    setupProfile(null);
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled />, { store: mockStore });
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeDisabled();
  });

  it('should show a loader while the avatar is uploading', async () => {
    setupProfile(null);
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled />, { store: mockStore });
    expect(screen.getByTestId(AvatarEditableTestIds.loading)).toBeOnTheScreen();
  });

  it('selects, uploads, refetches and displays the updated profile photo', async () => {
    const user = userEvent.setup();
    const setIsDisabled = jest.fn();
    const userId = setupProfile(MOCK_PROFILE.profilePhoto);
    const updatedPhoto = 'https://images.example.test/avatar.jpg';
    let currentPhoto = MOCK_PROFILE.profilePhoto;
    let requestBody: unknown;
    server.use(
      http.get(`${BASE_URL}/user/${userId}/profile`, () =>
        HttpResponse.json({ ...MOCK_PROFILE, userId, profilePhoto: currentPhoto }),
      ),
      http.patch(`${BASE_URL}/user/${userId}/profile`, async ({ request }) => {
        requestBody = await request.json();
        currentPhoto = updatedPhoto;
        return HttpResponse.json({ ...MOCK_PROFILE, userId, profilePhoto: updatedPhoto });
      }),
    );

    await renderWithProviders(<AvatarIconEditable setIsDisabled={setIsDisabled} isDisabled={false} />);
    await user.press(await screen.findByTestId(AvatarEditableTestIds.editBtn));

    await waitFor(() => expect(requestBody).toEqual({ profilePhoto: updatedPhoto }));
    await waitFor(() =>
      expect(screen.getByTestId(AvatarEditableTestIds.successImg).props.source.uri).toBe(updatedPhoto),
    );
    expect(setIsDisabled).toHaveBeenNthCalledWith(1, true);
    expect(setIsDisabled).toHaveBeenLastCalledWith(false);
  });

  it('waits for an avatar to pass moderation before updating the profile photo', async () => {
    const user = userEvent.setup();
    const userId = setupProfile(MOCK_PROFILE.profilePhoto);
    const updatedPhoto = 'https://images.example.test/approved-avatar.jpg';
    let requestBody: unknown;
    (uploadMediaFile as jest.Mock).mockResolvedValueOnce({
      assetId: 'avatar-asset',
      status: 'queued',
      contentType: 'image/jpeg',
    });
    (waitForMediaUploadReview as jest.Mock).mockResolvedValueOnce([
      {
        assetId: 'avatar-asset',
        status: 'approved',
        url: updatedPhoto,
        contentType: 'image/jpeg',
      },
    ]);
    server.use(
      http.patch(`${BASE_URL}/user/${userId}/profile`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ ...MOCK_PROFILE, userId, profilePhoto: updatedPhoto });
      }),
    );

    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />);
    await user.press(await screen.findByTestId(AvatarEditableTestIds.editBtn));

    await waitFor(() => expect(requestBody).toEqual({ profilePhoto: updatedPhoto }));
    expect(waitForMediaUploadReview).toHaveBeenCalledWith(
      [expect.objectContaining({ assetId: 'avatar-asset', status: 'queued' })],
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('does not update the profile photo when moderation rejects the avatar', async () => {
    const user = userEvent.setup();
    const userId = setupProfile(MOCK_PROFILE.profilePhoto);
    let profileUpdateCount = 0;
    (uploadMediaFile as jest.Mock).mockResolvedValueOnce({
      assetId: 'rejected-avatar',
      status: 'queued',
      contentType: 'image/jpeg',
    });
    (waitForMediaUploadReview as jest.Mock).mockResolvedValueOnce([
      {
        assetId: 'rejected-avatar',
        status: 'rejected',
        contentType: 'image/jpeg',
      },
    ]);
    server.use(
      http.patch(`${BASE_URL}/user/${userId}/profile`, () => {
        profileUpdateCount += 1;
        return HttpResponse.json(MOCK_PROFILE);
      }),
    );

    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />);
    await user.press(await screen.findByTestId(AvatarEditableTestIds.editBtn));

    await waitFor(() => expect(waitForMediaUploadReview).toHaveBeenCalled());
    expect(profileUpdateCount).toBe(0);
  });

  it('does not update the profile photo when moderation cannot approve the avatar', async () => {
    const user = userEvent.setup();
    const userId = setupProfile(MOCK_PROFILE.profilePhoto);
    let profileUpdateCount = 0;
    (uploadMediaFile as jest.Mock).mockResolvedValueOnce({
      assetId: 'failed-avatar',
      status: 'queued',
      contentType: 'image/jpeg',
    });
    (waitForMediaUploadReview as jest.Mock).mockResolvedValueOnce([
      {
        assetId: 'failed-avatar',
        status: 'failed',
        contentType: 'image/jpeg',
      },
    ]);
    server.use(
      http.patch(`${BASE_URL}/user/${userId}/profile`, () => {
        profileUpdateCount += 1;
        return HttpResponse.json(MOCK_PROFILE);
      }),
    );

    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />);
    await user.press(await screen.findByTestId(AvatarEditableTestIds.editBtn));

    await waitFor(() => expect(waitForMediaUploadReview).toHaveBeenCalled());
    expect(profileUpdateCount).toBe(0);
  });

  it('does not publish an avatar when the user cancels while moderation is pending', async () => {
    const user = userEvent.setup();
    const userId = setupProfile(MOCK_PROFILE.profilePhoto);
    let profileUpdateCount = 0;
    let resolveReview: (value: Awaited<ReturnType<typeof waitForMediaUploadReview>>) => void = () => undefined;
    (uploadMediaFile as jest.Mock).mockResolvedValueOnce({
      assetId: 'cancelled-avatar',
      status: 'queued',
      contentType: 'image/jpeg',
    });
    (waitForMediaUploadReview as jest.Mock).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveReview = resolve;
      }),
    );
    server.use(
      http.patch(`${BASE_URL}/user/${userId}/profile`, () => {
        profileUpdateCount += 1;
        return HttpResponse.json(MOCK_PROFILE);
      }),
    );

    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />);
    await user.press(await screen.findByTestId(AvatarEditableTestIds.editBtn));
    await waitFor(() => expect(waitForMediaUploadReview).toHaveBeenCalled());
    await user.press(screen.getByTestId(AvatarEditableTestIds.loading));
    await act(async () => {
      resolveReview([
        {
          assetId: 'cancelled-avatar',
          status: 'approved',
          url: 'https://images.example.test/cancelled-avatar.jpg',
          contentType: 'image/jpeg',
        },
      ]);
    });

    expect(profileUpdateCount).toBe(0);
  });

  it.each([
    ['cancelled', { canceled: true, assets: [] }],
    ['without assets', { canceled: false, assets: [] }],
    ['without an asset URI', { canceled: false, assets: [{ uri: '' }] }],
  ])('does not upload when the gallery result is %s', async (_description, result) => {
    setupProfile(null);
    (getAccessToGallery as jest.Mock).mockResolvedValueOnce(result);
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });

    await userEvent.setup().press(await screen.findByTestId(AvatarEditableTestIds.editBtn));

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
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });

    await userEvent.setup().press(await screen.findByTestId(AvatarEditableTestIds.editBtn));

    await waitFor(() => expect(compressMediaFile).toHaveBeenCalled());
    expect(uploadMediaFile).not.toHaveBeenCalled();
  });

  it('stops before updating when the media upload returns no photo', async () => {
    setupProfile(null);
    (uploadMediaFile as jest.Mock).mockResolvedValueOnce(null);
    const setIsDisabled = jest.fn();
    await renderWithProviders(<AvatarIconEditable setIsDisabled={setIsDisabled} isDisabled={false} />, {
      store: mockStore,
    });

    await userEvent.setup().press(await screen.findByTestId(AvatarEditableTestIds.editBtn));

    await waitFor(() => expect(uploadMediaFile).toHaveBeenCalled());
    expect(setIsDisabled).toHaveBeenLastCalledWith(false);
  });

  it('skips the upload when the account has no user id', async () => {
    mockStore.dispatch(setMockUserId(''));
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });

    await userEvent.setup().press(screen.getByTestId(AvatarEditableTestIds.editBtn));

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
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });

    await user.press(await screen.findByTestId(AvatarEditableTestIds.editBtn));
    await user.press(await screen.findByTestId(AvatarEditableTestIds.loading));
    await act(async () => {
      resolveCompression({
        file: 'compressed-avatar.jpg',
        originalName: 'avatar.jpg',
        extension: 'jpg',
        isVideo: false,
        mimeType: 'image/jpeg',
      });
    });

    await waitFor(() => expect(screen.queryByTestId(AvatarEditableTestIds.loading)).toBeNull());
    expect(uploadMediaFile).not.toHaveBeenCalled();
  });
});
