import { screen } from '@testing-library/react-native';
import { savePhotoUrl, setIsDisabledWhileSendingProfile } from '@R/slices/profile/profile';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { AvatarEditableTestIds } from './const';
import AvatarIconEditable from './editable';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
describe('Avatar icon editable', () => {
  it('should correctly renders', async () => {
    await renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, {
      store: mockStore,
    });
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeOnTheScreen();
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
});
