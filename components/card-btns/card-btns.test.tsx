import * as auth from '@A/context/auth-context';
import { COMMENT_BTN_TEST_ID } from '@C/card-comment-btn/const';
import { CARD_DELETE_BTN_TEST_ID } from '@C/card-delete-btn/const';
import { CARD_LIKE_BTN_TEST_ID_LIKED, CARD_LIKE_BTN_TEST_ID_NOT_LIKED } from '@C/card-like-btn/const';
import { MOCK_LIKES } from '@T/mocks/mock-likes';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import CardBtns from './card-btns';

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
      <CardBtns
        isShowDeleteBtn
        activityId="someActivityId"
        userId="someUserId"
        cardRef={{ current: '' }}
        fullViewRef={{ current: '' }}
        likes={MOCK_LIKES}
      />,
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
      <CardBtns
        isShowDeleteBtn
        activityId="someActivityId"
        userId="someUserId"
        cardRef={{ current: '' }}
        fullViewRef={{ current: '' }}
        likes={MOCK_LIKES}
      />,
      {
        store: mockStore,
      },
    );
    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
    expect(await screen.findByTestId(COMMENT_BTN_TEST_ID)).toBeOnTheScreen();
  });
});
