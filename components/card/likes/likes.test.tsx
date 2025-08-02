import { AvatarShowableTestIds } from '@C/avatar/showable/const';
import { screen } from '@testing-library/react-native';
import * as router from 'expo-router';
import { LikesSize } from './const';
import Likes from './likes';
import { setUserId } from '@R/slices/auth/auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';

jest.mock('expo-router', () => ({
  usePathname: () => 'some string',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('expo-image', () => {
  const actualExpoImage = jest.requireActual('expo-image');
  const { Image } = jest.requireActual('react-native');

  return { ...actualExpoImage, Image };
});
describe('Card likes', () => {
  it('should correctly renders', async () => {
    jest.spyOn(router, 'usePathname').mockImplementation(() => 'some path');
    mockStore.dispatch(setUserId('someUserId'));
    renderWithProviders(<Likes activityId="617dddae-05b3-418a-9a8e-5d408a1b897a" size={LikesSize.big} />, {
      store: mockStore,
    });
    expect(await screen.findByTestId('pushToActivityLikes')).toBeOnTheScreen();
    expect(await screen.findByTestId(AvatarShowableTestIds.success)).toBeOnTheScreen();
  });
});
