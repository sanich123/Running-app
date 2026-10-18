import { screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentCountBadge from './comment-count-badge';

describe('CommentCountBadge', () => {
  it('shows the activity comment count when comments are available', async () => {
    server.use(http.get(`${BASE_URL}/comment/activity-1/count`, () => HttpResponse.json(4)));
    await renderWithProviders(
      <CommentCountBadge
        activity={{ id: 'activity-1', userId: 'owner-1', commentsLength: 4, profile: MOCK_PROFILE }}
      />,
    );

    expect(await screen.findByText('4')).toBeOnTheScreen();
  });
});
