import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { BASE_URL } from '@T/utils/handlers';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentDeleteBtn from './comment-delete-btn';

describe('comment delete btn', () => {
  it('deletes the comment and refreshes its activity count', async () => {
    const user = userEvent.setup();
    let deletedUrl = '';
    let countRequests = 0;
    server.use(
      http.delete(`${BASE_URL}/comment/comment-id`, ({ request }) => {
        deletedUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
      http.get(`${BASE_URL}/comment/activity-id/count`, () => {
        countRequests += 1;
        return HttpResponse.json(0);
      }),
    );
    await renderWithProviders(<CommentDeleteBtn commentId="comment-id" activityId="activity-id" />);
    await user.press(screen.getByRole('button'));
    await waitFor(() => expect(deletedUrl).toContain('/comment/comment-id'));
    await waitFor(() => expect(countRequests).toBe(1));
  });
});
