import { screen } from '@testing-library/react-native';

import AvatarShowable from './avatar-showable';
import { MOCK_PROFILE } from '../../tests/mocks/mock-location';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Avatar showable', () => {
  it('should correctly render mocked data in image', async () => {
    renderWithProviders(<AvatarShowable size={25} id="someUserId" />, { store: mockStore });
    expect(screen.getByTestId('avatarShowableLoadingIcon')).toBeOnTheScreen();
    const image = await screen.findByTestId('avatarShowableImage');
    expect(image.props.source.uri).toEqual(MOCK_PROFILE.profilePhoto);
  });
  it('should correctly renders, when an error occured', async () => {
    renderWithProviders(<AvatarShowable size={25} id="someUserIdWithAnError" />, { store: mockStore });
    expect(screen.getByTestId('avatarShowableLoadingIcon')).toBeOnTheScreen();
    expect(await screen.findByTestId('errorComponentId')).toBeOnTheScreen();
    expect(await screen.findByText('An error occured')).toBeOnTheScreen();
  });
});
