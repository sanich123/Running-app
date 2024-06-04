import { savePhotoUrl, setIsDisabledWhileSendingProfile } from '@R/profile/profile';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import { AvatarEditableTestIds } from './const';
import AvatarIconEditable from './editable';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));

describe('Avatar icon editable', () => {
  it('should correctly renders', () => {
    renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, { store: mockStore });
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeOnTheScreen();
  });
  it('should renders an image, when profile has an image url', () => {
    mockStore.dispatch(savePhotoUrl(MOCK_PROFILE.profilePhoto));
    renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, { store: mockStore });
    const img = screen.getByTestId(AvatarEditableTestIds.successImg);
    expect(img.props.source[0].uri).toEqual(MOCK_PROFILE.profilePhoto);
  });
  it('should renders a default icon, when there is no image url in profile', () => {
    mockStore.dispatch(savePhotoUrl(''));
    renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, { store: mockStore });
    expect(screen.getByTestId(AvatarEditableTestIds.default)).toBeOnTheScreen();
  });
  it('should be disabled, when isDisabled', () => {
    renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled />, { store: mockStore });
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeDisabled();
  });
  it('should be disabled, when isDisabledWhileSendingProfile', () => {
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    renderWithProviders(<AvatarIconEditable setIsDisabled={jest.fn()} isDisabled={false} />, { store: mockStore });
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeDisabled();
  });
});
