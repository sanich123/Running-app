import { screen } from '@testing-library/react-native';

import AvatarIconEditable from './avatar-editable';
import { setIsDisabledWhileSendingProfile } from '../../redux/profile/profile';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
describe('Avatar icon editable', () => {
  it('should correctly renders', () => {
    renderWithProviders(
      <AvatarIconEditable
        image=""
        setImage={jest.fn()}
        setIsDisabled={jest.fn()}
        setPhotoUrl={jest.fn()}
        isDisabled={false}
      />,
      { store: mockStore },
    );
    expect(screen.getByTestId('avatarEditableButton')).toBeOnTheScreen();
  });
  it('should renders an image', () => {
    renderWithProviders(
      <AvatarIconEditable
        image="some url"
        setImage={jest.fn()}
        setIsDisabled={jest.fn()}
        setPhotoUrl={jest.fn()}
        isDisabled={false}
      />,
      { store: mockStore },
    );
    expect(screen.getByTestId('avatarEditableImage')).toBeOnTheScreen();
    expect(screen.getByTestId('avatarEditableImage').props.source.uri).toEqual('some url');
  });
  it('should be disabled, when isDisabled', () => {
    renderWithProviders(
      <AvatarIconEditable
        image="some url"
        setImage={jest.fn()}
        setIsDisabled={jest.fn()}
        setPhotoUrl={jest.fn()}
        isDisabled
      />,
      { store: mockStore },
    );
    expect(screen.getByTestId('avatarEditableButton')).toBeDisabled();
  });
  it('should be disabled, when isDisabledWhileSendingProfile', () => {
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    renderWithProviders(
      <AvatarIconEditable
        image="some url"
        setImage={jest.fn()}
        setIsDisabled={jest.fn()}
        setPhotoUrl={jest.fn()}
        isDisabled={false}
      />,
      { store: mockStore },
    );
    expect(screen.getByTestId('avatarEditableButton')).toBeDisabled();
  });
});
