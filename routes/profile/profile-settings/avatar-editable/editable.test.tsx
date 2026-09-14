import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { setUserId } from '@R/slices/auth/auth';
import { savePhotoUrl, setIsDisabledWhileSendingProfile } from '@R/slices/profile/profile';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
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
  compressAndSendFile: jest.fn(() =>
    Promise.resolve({ url: 'https://images.example.test/avatar.jpg', thumbnail: null }),
  ),
}));
describe('Avatar icon editable', () => {
  it('should correctly renders', async () => {
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeOnTheScreen();
    expect(screen.getByTestId(AvatarEditableTestIds.editIcon)).toBeOnTheScreen();
  });
  it('should renders an image, when profile has an image url', async () => {
    mockStore.dispatch(savePhotoUrl(MOCK_PROFILE.profilePhoto));
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });
    const img = screen.getByTestId(AvatarEditableTestIds.successImg);
    expect(img.props.source.uri).toEqual(MOCK_PROFILE.profilePhoto);
  });
  it('should renders a default icon, when there is no image url in profile', async () => {
    mockStore.dispatch(savePhotoUrl(''));
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });
    expect(screen.getByTestId(AvatarEditableTestIds.default)).toBeOnTheScreen();
  });
  it('should be disabled, when isDisabled', async () => {
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled />, { store: mockStore });
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeDisabled();
  });
  it('should be disabled, when isDisabledWhileSendingProfile', async () => {
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeDisabled();
  });

  it('should show a loader while the avatar is uploading', async () => {
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled />, { store: mockStore });
    expect(screen.getByTestId(AvatarEditableTestIds.loading)).toBeOnTheScreen();
  });

  it('selects, uploads and stores a new avatar', async () => {
    const user = userEvent.setup();
    const setIsDisabled = jest.fn();
    let requestBody: unknown;
    server.use(
      http.patch(`${BASE_URL}/user/avatar-user/profile`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ profilePhoto: 'https://images.example.test/avatar.jpg' });
      }),
    );
    mockStore.dispatch(setIsDisabledWhileSendingProfile(false));
    mockStore.dispatch(setUserId('avatar-user'));
    await renderWithProviders(<AvatarIconEditable setIsDisabled={setIsDisabled} isDisabled={false} />);
    await user.press(screen.getByTestId(AvatarEditableTestIds.editBtn));
    await waitFor(() => expect(requestBody).toEqual({ profilePhoto: 'https://images.example.test/avatar.jpg' }));
    expect(mockStore.getState().profile.settings.profilePhoto).toBe('https://images.example.test/avatar.jpg');
    expect(setIsDisabled).toHaveBeenNthCalledWith(1, true);
    expect(setIsDisabled).toHaveBeenLastCalledWith(false);
  });
});
