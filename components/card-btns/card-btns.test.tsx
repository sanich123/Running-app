import { COMMENT_BTN_TEST_ID } from '@C/card-comment-btn/const';
import { CARD_DELETE_BTN_TEST_ID } from '@C/card-delete-btn/const';
import { CARD_LIKE_BTN_TEST_ID_LIKED, CARD_LIKE_BTN_TEST_ID_NOT_LIKED } from '@C/card-like-btn/const';
import { MOCK_LIKE } from '@T/mocks/mock-likes';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import CardBtns from './card-btns';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/home/activity/someActivityId',
}));

jest.mock('../../auth/context/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
      app_metadata: {
        someProp: 'some value',
      },
      user_metadata: {
        someProp: 'some value',
      },
      aud: '',
      created_at: '',
    },
  }),
}));

describe('Card btns', () => {
  it('should correctly renders with deleteBtn', async () => {
    renderWithProviders(
      <CardBtns
        isShowDeleteBtn
        activityId="someActivityId"
        userId={MOCK_LIKE[0].authorId}
        cardRef={{ current: '' }}
        fullViewRef={{ current: '' }}
        likes={MOCK_LIKE}
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
    renderWithProviders(
      <CardBtns
        isShowDeleteBtn
        activityId="someActivityId"
        userId="someUserId"
        cardRef={{ current: '' }}
        fullViewRef={{ current: '' }}
        likes={[
          {
            activityId: '617dddae-05b3-418a-9a8e-5d408a1b897a',
            authorId: 'someWrongUserId',
            date: '2023-10-07T14:38:05.885Z',
            id: '20715e5a-17b1-46ac-9814-5ffb5fde8ac9',
          },
        ]}
      />,
      {
        store: mockStore,
      },
    );
    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
    expect(await screen.findByTestId(COMMENT_BTN_TEST_ID)).toBeOnTheScreen();
  });
});
