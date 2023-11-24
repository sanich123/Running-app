import { screen } from '@testing-library/react-native';
import * as router from 'expo-router';

import CardLikes from '../../components/card-likes/card-likes';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

jest.mock('expo-router', () => ({
  usePathname: () => 'some string',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
describe('Card likes', () => {
  it('should correctly renders', async () => {
    jest.spyOn(router, 'usePathname').mockImplementation(() => 'some path');
    renderWithProviders(<CardLikes activityId="617dddae-05b3-418a-9a8e-5d408a1b897a" />, {
      store: mockStore,
    });
    expect(screen.getByTestId('pushToActivityLikes')).toBeOnTheScreen();
    expect(await screen.findByTestId('pushToActivityLikes')).toBeOnTheScreen();
    expect(await screen.findByTestId('avatarShowableImage')).toBeOnTheScreen();
  });
});
