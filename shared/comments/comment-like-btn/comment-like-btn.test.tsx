import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { errorToast } from '@S/error-toast/error-toast';
import { MOCK_LIKES } from '@T/mocks/mock-likes';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentLikeBtn from './comment-like-btn';

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));

describe('Comment like btn', () => {
  it('should correctly renders, when liked by you', async () => {
    mockStore.dispatch(setMockUserId('7857abb1-b125-4f39-becf-8f30216b46ec'));
    await renderWithProviders(
      <CommentLikeBtn commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb" commentLikesFromComment={MOCK_LIKES} />,
      { store: mockStore },
    );
    expect(await screen.findByTestId('commentLikeBtn-active')).toBeOnTheScreen();
  });
  it('should correctly renders, when not liked by you', async () => {
    mockStore.dispatch(setMockUserId('someWrongId'));
    await renderWithProviders(
      <CommentLikeBtn commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb" commentLikesFromComment={MOCK_LIKES} />,
      { store: mockStore },
    );
    expect(await screen.findByTestId('commentLikeBtn')).toBeOnTheScreen();
  });

  it('sends a like to the comment after pressing the heart', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    let getRequests = 0;
    mockStore.dispatch(setMockUserId('new-comment-like-author'));
    server.use(
      http.get(`${BASE_URL}/comment/922dca27-f99c-4165-96d6-5a04bbb6e9cb/like`, () => {
        getRequests += 1;
        return HttpResponse.json([]);
      }),
      http.post(`${BASE_URL}/comment/922dca27-f99c-4165-96d6-5a04bbb6e9cb/like`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'comment-like-id' }, { status: 201 });
      }),
    );
    await renderWithProviders(
      <CommentLikeBtn commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb" commentLikesFromComment={[]} />,
    );
    expect(getRequests).toBe(0);
    const likeButton = await screen.findByTestId('commentLikeBtn');
    await waitFor(() => expect(likeButton.props.accessibilityState?.disabled).toBe(false));
    await user.press(likeButton);
    await waitFor(() => expect(requestBody).toEqual({ commentId: '922dca27-f99c-4165-96d6-5a04bbb6e9cb' }));
  });

  it('removes your existing like after pressing the active heart', async () => {
    const user = userEvent.setup();
    let deleteRequest: string | undefined;
    const ownLike = MOCK_LIKES[0];
    mockStore.dispatch(setMockUserId(ownLike.authorId));
    server.use(
      http.get(`${BASE_URL}/comment/${ownLike.activityId}/like`, () => HttpResponse.json([ownLike])),
      http.delete(`${BASE_URL}/comment/${ownLike.id}/like`, ({ request }) => {
        deleteRequest = request.method;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderWithProviders(<CommentLikeBtn commentId={ownLike.activityId} commentLikesFromComment={[ownLike]} />);
    const likeButton = await screen.findByTestId('commentLikeBtn-active');
    await waitFor(() => expect(likeButton.props.accessibilityState?.disabled).toBe(false));
    await user.press(likeButton);
    await waitFor(() => expect(deleteRequest).toBe('DELETE'));
  });

  it('disables the button when likes cannot be loaded and reports a failed like request', async () => {
    server.use(
      http.get(`${BASE_URL}/comment/broken-comment/like`, () =>
        HttpResponse.json({ message: 'failed' }, { status: 500 }),
      ),
    );
    await renderWithProviders(
      <CommentLikeBtn
        commentId="broken-comment"
        commentLikesFromComment={[{ id: 'known-like', authorId: 'other-author' }]}
      />,
    );
    const disabledButton = await screen.findByTestId('commentLikeBtn');
    expect(disabledButton.props.accessibilityState?.disabled).toBe(true);

    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/comment/failed-like/like`, () => HttpResponse.json([])),
      http.post(`${BASE_URL}/comment/failed-like/like`, () =>
        HttpResponse.json({ message: 'failed' }, { status: 500 }),
      ),
    );
    await renderWithProviders(<CommentLikeBtn commentId="failed-like" commentLikesFromComment={[]} />);
    const likeButton = await screen.findByTestId('commentLikeBtn');
    await waitFor(() => expect(likeButton.props.accessibilityState?.disabled).toBe(false));
    await user.press(likeButton);
    await waitFor(() => expect(errorToast).toHaveBeenCalled());
  });
});
