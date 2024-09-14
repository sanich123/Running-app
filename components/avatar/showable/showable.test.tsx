import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import { AvatarShowableTestIds } from './const';
import AvatarShowable from './showable';
jest.mock('expo-image', () => {
  const actualExpoImage = jest.requireActual('expo-image');
  const { Image } = jest.requireActual('react-native');

  return { ...actualExpoImage, Image };
});
describe('Avatar showable', () => {
  it('should correctly handle isLoading and success state', async () => {
    renderWithProviders(<AvatarShowable size={25} id="someUserId" />, { store: mockStore });
    expect(await screen.findByTestId(AvatarShowableTestIds.success)).toBeOnTheScreen();
  });
  it('should correctly handle isLoading and error state', async () => {
    renderWithProviders(<AvatarShowable size={25} id="someUserIdWithAnError" />, { store: mockStore });
    expect(await screen.findByTestId(AvatarShowableTestIds.error)).toBeOnTheScreen();
  });
  it('should render a default icon, when !error !isLoading !profile', async () => {
    renderWithProviders(<AvatarShowable size={25} id="someUserIdWithoutPhoto" />, { store: mockStore });
    expect(await screen.findByTestId(AvatarShowableTestIds.default)).toBeOnTheScreen();
  });
});
