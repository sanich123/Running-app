import { screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import * as router from 'expo-router';
import { setUserId } from '@R/slices/auth/auth';
import { AvatarShowableTestIds } from '@S/avatar/showable/const';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LIKE_BTN, LikesSize } from './const';
import Likes from './likes';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  usePathname: () => 'some string',
  useRouter: () => ({
    push: mockPush,
  }),
}));
describe('Card likes', () => {
  it('formats like action errors in both languages', () => {
    expect(LIKE_BTN.english.errorAction('delete')).toContain('deleting');
    expect(LIKE_BTN.english.errorAction('send')).toContain('sending');
    expect(LIKE_BTN.russian.errorAction('delete')).toContain('удаления');
    expect(LIKE_BTN.russian.errorAction('send')).toContain('отправки');
  });

  it('should correctly renders', async () => {
    jest.spyOn(router, 'usePathname').mockImplementation(() => 'some path');
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<Likes activityId="617dddae-05b3-418a-9a8e-5d408a1b897a" size={LikesSize.big} />, {
      store: mockStore,
    });
    expect(await screen.findByTestId('pushToActivityLikes')).toBeOnTheScreen();
    const avatar = await screen.findByTestId(AvatarShowableTestIds.success);
    expect(avatar).toBeOnTheScreen();
    expect(avatar.props.cachePolicy).toBe('memory-disk');
    expect(avatar.props.recyclingKey).toBe('someUserId');
    expect(avatar.props.transition).toBe(0);
  });

  it('renders the compact likes count', async () => {
    await renderWithProviders(<Likes activityId="617dddae-05b3-418a-9a8e-5d408a1b897a" size={LikesSize.small} />);

    expect(await screen.findByTestId('pushToActivityLikes')).toBeOnTheScreen();
  });

  it('renders an empty state when likes are skipped', async () => {
    await renderWithProviders(<Likes activityId="" size={LikesSize.big} />);

    expect(screen.queryByTestId('pushToActivityLikes')).not.toBeOnTheScreen();
  });

  it('opens the likes modal in the web flow', async () => {
    const user = userEvent.setup();
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    await renderWithProviders(<Likes activityId="617dddae-05b3-418a-9a8e-5d408a1b897a" size={LikesSize.big} />);
    await user.press(await screen.findByTestId('pushToActivityLikes'));
    expect(mockPush).not.toHaveBeenCalled();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
