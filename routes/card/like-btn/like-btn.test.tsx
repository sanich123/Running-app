import { screen } from '@testing-library/react-native';
import { setUserId } from '@R/slices/auth/auth';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { CARD_LIKE_BTN_TEST_ID_LIKED, CARD_LIKE_BTN_TEST_ID_NOT_LIKED } from './const';
import ActivityCardLikeBtn from './like-btn';

describe('Activity card like btn', () => {
  it('should correctly renders when activity was liked by you', async () => {
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<ActivityCardLikeBtn activityId="someActivityId" profile={MOCK_PROFILE} />, {
      store: mockStore,
    });
    const likesBtn = await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED);
    expect(likesBtn).toBeOnTheScreen();
  });
  it('should correctly renders, when you didnt liked activity', async () => {
    mockStore.dispatch(setUserId('wrongUserId'));
    await renderWithProviders(<ActivityCardLikeBtn activityId="someActivityId" profile={MOCK_PROFILE} />, {
      store: mockStore,
    });
    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
  });
});
