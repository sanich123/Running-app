import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { setUserId } from '@R/slices/auth/auth';
import { setCommentActivityId, setIsShowingTextInput } from '@R/slices/comment/comment';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { server } from '@T/utils/server';
import CommentInput from './comment-input';
import { COMMENT_ICON_TEST_ID, COMMENT_INPUT_TEST_ID } from './const';
import { mockStore } from '../../../tests/utils/mock-store';
import { renderWithProviders } from '../../../tests/utils/test-utils';

describe('Comment input', () => {
  it('should correctly renders', async () => {
    await renderWithProviders(<CommentInput commentId="someCommentId" profile={MOCK_PROFILE} />, {
      store: mockStore,
    });
    expect(screen.getByTestId(COMMENT_INPUT_TEST_ID)).toBeOnTheScreen();
  });
  it('should correctly change local state', async () => {
    await renderWithProviders(<CommentInput commentId="someCommentId" profile={MOCK_PROFILE} />, { store: mockStore });
    const commentInput = screen.getByTestId(COMMENT_INPUT_TEST_ID);
    await userEvent.type(commentInput, 'some text');
    expect(commentInput.props.value).toEqual('some text');
    await userEvent.clear(commentInput);
    expect(commentInput.props.value).toEqual('');
  });
  it('should correctly renders comment sending icon', async () => {
    await renderWithProviders(<CommentInput commentId="someCommentId" profile={MOCK_PROFILE} />, {
      store: mockStore,
    });
    const commentInput = screen.getByTestId(COMMENT_INPUT_TEST_ID);
    await userEvent.type(commentInput, 'some comment');
    const commentSendingIcon = screen.getByTestId(COMMENT_ICON_TEST_ID);
    expect(commentSendingIcon).toBeOnTheScreen();
  });

  it('posts the written comment and closes the input after success', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    mockStore.dispatch(setUserId('comment-author-id'));
    mockStore.dispatch(setCommentActivityId('someActivityId'));
    mockStore.dispatch(setIsShowingTextInput(true));
    server.use(
      http.post(`${BASE_URL}/comment/someActivityId`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'new-comment-id' }, { status: 201 });
      }),
    );
    await renderWithProviders(<CommentInput commentId="" profile={{ ...MOCK_PROFILE, emailNotifications: false }} />);
    await user.type(screen.getByTestId(COMMENT_INPUT_TEST_ID), 'A real test comment');
    await user.press(screen.getByTestId(COMMENT_ICON_TEST_ID));
    await waitFor(() => expect(requestBody).toEqual({ comment: 'A real test comment', authorId: 'comment-author-id' }));
    expect(mockStore.getState().comment.isShowingTextInput).toBe(false);
  });
});
