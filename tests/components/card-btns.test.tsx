import { screen } from '@testing-library/react-native';

import * as auth from '../../auth/context/auth-context';
import CardBtns from '../../components/card-btns/card-btns';
import { COMMENT_BTN_TEST_ID } from '../../components/card-comment-btn/const';
import { CARD_DELETE_BTN_TEST_ID } from '../../components/card-delete-btn/const';
import { CARD_LIKE_BTN_TEST_ID_LIKED, CARD_LIKE_BTN_TEST_ID_NOT_LIKED } from '../../components/card-like-btn/const';
import { USER_AUTH_MOCKS } from '../mocks/use-auth';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

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
    renderWithProviders(
      <CardBtns activityId="someActivityId" userId="someUserId" cardRef={undefined} fullViewRef={undefined} />,
      {
        store: mockStore,
      },
    );
    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED)).toBeOnTheScreen();
    expect(await screen.findByTestId(COMMENT_BTN_TEST_ID)).toBeOnTheScreen();
    expect(await screen.findByTestId(CARD_DELETE_BTN_TEST_ID)).toBeOnTheScreen();
  });
  it('should correctly renders likes icon, when userId === user.id, and without delete btn', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someWrongUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(
      <CardBtns activityId="someActivityId" userId="someUserId" cardRef={undefined} fullViewRef={undefined} />,
      {
        store: mockStore,
      },
    );
    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
    expect(await screen.findByTestId(COMMENT_BTN_TEST_ID)).toBeOnTheScreen();
  });
});
