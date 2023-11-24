import { screen } from '@testing-library/react-native';

import AvatarShowable from '../../components/avatar-showable/avatar-showable';
import { AvatarShowableTestIds } from '../../components/avatar-showable/const';
import { MOCK_PROFILE } from '../mocks/mock-location';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

describe('Avatar showable', () => {
  it('should correctly handle isLoading and success state', async () => {
    renderWithProviders(<AvatarShowable size={25} id="someUserId" />, { store: mockStore });
    expect(screen.getByTestId(AvatarShowableTestIds.isLoading)).toBeOnTheScreen();
    const image = await screen.findByTestId(AvatarShowableTestIds.success);
    expect(image.props.source.uri).toEqual(MOCK_PROFILE.profilePhoto);
  });
  it('should correctly handle isLoading and error state', async () => {
    renderWithProviders(<AvatarShowable size={25} id="someUserIdWithAnError" />, { store: mockStore });
    expect(screen.getByTestId(AvatarShowableTestIds.isLoading)).toBeOnTheScreen();
    expect(await screen.findByTestId(AvatarShowableTestIds.error)).toBeOnTheScreen();
  });
  it('should render a default icon, when !error !isLoading !profile', async () => {
    renderWithProviders(<AvatarShowable size={25} id="someUserIdWithoutPhoto" />, { store: mockStore });
    expect(screen.getByTestId(AvatarShowableTestIds.isLoading)).toBeOnTheScreen();
    expect(await screen.findByTestId(AvatarShowableTestIds.default)).toBeOnTheScreen();
  });
});
