import { screen } from '@testing-library/react-native';

import ActivityCardLikeBtn from './card-like-btn';
import { CARD_LIKE_BTN_TEST_ID_LIKED, CARD_LIKE_BTN_TEST_ID_NOT_LIKED } from './const';
import * as auth from '../../auth/context/auth-context';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Activity card like btn', () => {
  it('should correctly renders when activity was liked by you', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<ActivityCardLikeBtn activityId="someActivityId" />, { store: mockStore });
    const likesBtn = await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED);
    expect(likesBtn).toBeOnTheScreen();
  });
  it('should correctly renders, when you didnt liked activity', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someWrongUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<ActivityCardLikeBtn activityId="someActivityId" />, { store: mockStore });
    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
  });
});
