import { screen } from '@testing-library/react-native';

import CardBtns from './card-btns';
import * as auth from '../../auth/context/auth-context';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/home/activity/someActivityId',
}));

describe('Card btns', () => {
  it('should correctly renders with deleteBtn', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<CardBtns activityId="someActivityId" userId="someUserId" />, { store: mockStore });
    expect(await screen.findByTestId('iconLikeButton-liked')).toBeOnTheScreen();
    expect(await screen.findByTestId('activityCardCommentBtnIcon')).toBeOnTheScreen();
    expect(await screen.findByTestId('activityCardDeleteBtn')).toBeOnTheScreen();
  });
  it('should correctly renders likes icon, when userId === user.id, and without delete btn', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someWrongUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<CardBtns activityId="someActivityId" userId="someUserId" />, { store: mockStore });
    expect(await screen.findByTestId('iconLikeButton')).toBeOnTheScreen();
    expect(await screen.findByTestId('activityCardCommentBtnIcon')).toBeOnTheScreen();
  });
});
