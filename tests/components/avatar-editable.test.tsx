import { screen } from '@testing-library/react-native';

import AvatarIconEditable from '../../components/avatar-editable/avatar-editable';
import { AvatarEditableTestIds } from '../../components/avatar-editable/const';
import { setIsDisabledWhileSendingProfile } from '../../redux/profile/profile';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

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
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeOnTheScreen();
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
    const img = screen.getByTestId(AvatarEditableTestIds.successImg);
    expect(img.props.source.uri).toEqual('some url');
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
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeDisabled();
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
    expect(screen.getByTestId(AvatarEditableTestIds.editBtn)).toBeDisabled();
  });
});
