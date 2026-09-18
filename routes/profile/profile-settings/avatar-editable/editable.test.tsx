import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { AvatarEditableTestIds } from './const';
import AvatarIconEditable from './editable';

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
});
