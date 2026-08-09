import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentDeleteBtn from './comment-delete-btn';

describe('comment delete btn', () => {
  it('deletes the comment and marks its activity for refresh', async () => {
    const user = userEvent.setup();
    let deletedUrl = '';
    server.use(
      http.delete(`${BASE_URL}/comment/comment-id`, ({ request }) => {
        deletedUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderWithProviders(<CommentDeleteBtn commentId="comment-id" activityId="activity-id" />);
    await user.press(screen.getByRole('button'));
    await waitFor(() => expect(deletedUrl).toContain('/comment/comment-id'));
    await waitFor(() => expect(mockStore.getState().mainFeed.activityIdWhichCommentsToUpdate).toBe('activity-id'));
  });
});
