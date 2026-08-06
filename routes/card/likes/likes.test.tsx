import { screen } from '@testing-library/react-native';
import * as router from 'expo-router';
import { setUserId } from '@R/slices/auth/auth';
import { AvatarShowableTestIds } from '@Routes/avatar/showable/const';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LikesSize } from './const';
import Likes from './likes';

jest.mock('expo-router', () => ({
  usePathname: () => 'some string',
  useRouter: () => ({
    push: jest.fn(),
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
});
