import { screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import * as router from 'expo-router';
import { ROUTES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { AvatarShowableTestIds } from '@S/avatar/showable/const';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LikesSize } from './const';
import Likes from './likes';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  usePathname: () => 'some string',
  useRouter: () => ({
    push: mockPush,
  }),
}));
describe('Card likes', () => {
  it('should correctly renders', async () => {
    jest.spyOn(router, 'usePathname').mockImplementation(() => 'some path');
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<Likes activityId="617dddae-05b3-418a-9a8e-5d408a1b897a" size={LikesSize.big} />, {
      store: mockStore,
    });
    expect(await screen.findByTestId('pushToActivityLikes')).toBeOnTheScreen();
    expect(await screen.findByTestId(AvatarShowableTestIds.success)).toBeOnTheScreen();
  });

  it('opens the complete likes page in the web flow', async () => {
    const user = userEvent.setup();
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    await renderWithProviders(<Likes activityId="617dddae-05b3-418a-9a8e-5d408a1b897a" size={LikesSize.big} />);
    await user.press(await screen.findByTestId('pushToActivityLikes'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.likes}/617dddae-05b3-418a-9a8e-5d408a1b897a`);
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
