import { MOCK_LIKE } from '@T/mocks/mock-likes';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import ActivityCardLikeBtn from './card-like-btn';
import { CARD_LIKE_BTN_TEST_ID_LIKED, CARD_LIKE_BTN_TEST_ID_NOT_LIKED } from './const';

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
describe('Activity card like btn', () => {
  it('should correctly renders when activity was liked by you', async () => {
    renderWithProviders(
      <ActivityCardLikeBtn setManualAddLike={jest.fn()} activityId="someActivityId" likes={MOCK_LIKE} />,
      { store: mockStore },
    );
    const likesBtn = await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED);
    expect(likesBtn).toBeOnTheScreen();
  });
  it('should correctly renders, when you didnt liked activity', async () => {
    renderWithProviders(
      <ActivityCardLikeBtn
        setManualAddLike={jest.fn()}
        activityId="someActivityId"
        likes={[
          {
            activityId: '617dddae-05b3-418a-9a8e-5d408a1b897a',
            authorId: 'someUserId',
            date: '2023-10-07T14:38:05.885Z',
            id: '20715e5a-17b1-46ac-9814-5ffb5fde8ac9',
          },
        ]}
      />,
      { store: mockStore },
    );
    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
  });
});
