import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { setUserId } from '@R/slices/auth/auth';
import { MOCK_LIKES } from '@T/mocks/mock-likes';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentLikeBtn from './comment-like-btn';

describe('Comment like btn', () => {
  it('should correctly renders, when liked by you', async () => {
    mockStore.dispatch(setUserId('7857abb1-b125-4f39-becf-8f30216b46ec'));
    await renderWithProviders(
      <CommentLikeBtn
        commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb"
        commentLikesFromComment={MOCK_LIKES}
        comment={''}
        profile={MOCK_PROFILE}
      />,
      { store: mockStore },
    );
    expect(await screen.findByTestId('commentLikeBtn-active')).toBeOnTheScreen();
  });
  it('should correctly renders, when not liked by you', async () => {
    mockStore.dispatch(setUserId('someWrongId'));
    await renderWithProviders(
      <CommentLikeBtn
        commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb"
        commentLikesFromComment={MOCK_LIKES}
        profile={MOCK_PROFILE}
        comment={''}
      />,
      { store: mockStore },
    );
    expect(await screen.findByTestId('commentLikeBtn')).toBeOnTheScreen();
  });

  it('sends a like to the comment after pressing the heart', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    mockStore.dispatch(setUserId('new-comment-like-author'));
    server.use(
      http.post(`${BASE_URL}/comment/922dca27-f99c-4165-96d6-5a04bbb6e9cb/like`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'comment-like-id' }, { status: 201 });
      }),
    );
    await renderWithProviders(
      <CommentLikeBtn
        commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb"
        commentLikesFromComment={[]}
        profile={{ ...MOCK_PROFILE, emailNotifications: false }}
        comment="Test comment"
      />,
    );
    const likeButton = await screen.findByTestId('commentLikeBtn');
    await waitFor(() => expect(likeButton.props.accessibilityState?.disabled).toBe(false));
    await user.press(likeButton);
    await waitFor(() =>
      expect(requestBody).toEqual({
        commentId: '922dca27-f99c-4165-96d6-5a04bbb6e9cb',
        authorId: 'new-comment-like-author',
      }),
    );
  });
});
