import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { setCommentActivityId, setCommentToUpdate, setIdOfUpdatingComment } from '@R/slices/comment/comment';
import { BASE_URL } from '@T/utils/handlers';
import { server } from '@T/utils/server';
import CommentInput from './comment-input';
import { COMMENT_ICON_TEST_ID, COMMENT_INPUT_TEST_ID } from './const';
import { mockStore, setMockUserId } from '../../../tests/utils/mock-store';
import { renderWithProviders } from '../../../tests/utils/test-utils';

describe('Comment input', () => {
  it('should correctly renders', async () => {
    await renderWithProviders(<CommentInput commentId="someCommentId" />, {
      store: mockStore,
    });
    expect(screen.getByTestId(COMMENT_INPUT_TEST_ID)).toBeOnTheScreen();
  });
  it('should correctly change local state', async () => {
    await renderWithProviders(<CommentInput commentId="someCommentId" />, { store: mockStore });
    const commentInput = screen.getByTestId(COMMENT_INPUT_TEST_ID);
    await userEvent.type(commentInput, 'some text');
    expect(commentInput.props.value).toEqual('some text');
    await userEvent.clear(commentInput);
    expect(commentInput.props.value).toEqual('');
  });
  it('should correctly renders comment sending icon', async () => {
    await renderWithProviders(<CommentInput commentId="someCommentId" />, {
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
    mockStore.dispatch(setMockUserId('comment-author-id'));
    mockStore.dispatch(setCommentActivityId('someActivityId'));
    server.use(
      http.post(`${BASE_URL}/comment/someActivityId`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'new-comment-id' }, { status: 201 });
      }),
      http.get(`${BASE_URL}/comment/someActivityId/count`, () => HttpResponse.json(1)),
    );
    await renderWithProviders(<CommentInput commentId="" />);
    await user.type(screen.getByTestId(COMMENT_INPUT_TEST_ID), 'A real test comment');
    await user.press(screen.getByTestId(COMMENT_ICON_TEST_ID));
    await waitFor(() => expect(requestBody).toEqual({ comment: 'A real test comment' }));
  });

  it('closes the composer without sending an empty comment', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setIdOfUpdatingComment(''));
    mockStore.dispatch(setCommentToUpdate(''));
    await renderWithProviders(<CommentInput commentId="" />);

    await user.press(screen.getByTestId('comment-input-cancel'));

    expect(mockStore.getState().comment.idOfUpdatingComment).toBe('');
    expect(mockStore.getState().comment.commentToUpdate).toBe('');
  });

  it('updates an existing comment only when its normalized text changes', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    mockStore.dispatch(setCommentActivityId('edit-activity'));
    server.use(
      http.patch(`${BASE_URL}/comment/edit-comment`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'edit-comment' });
      }),
    );
    await renderWithProviders(<CommentInput commentId="edit-comment" commentToUpdate="Old text" />);
    expect(screen.getByText('Редактирование комментария')).toBeOnTheScreen();
    const input = screen.getByTestId(COMMENT_INPUT_TEST_ID);
    await user.clear(input);
    await user.type(input, '  Updated text  ');
    await user.press(screen.getByTestId(COMMENT_ICON_TEST_ID));

    await waitFor(() => expect(requestBody).toEqual({ comment: 'Updated text' }));
  });

  it('does not send an unchanged or empty edited comment', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setCommentActivityId('unchanged-activity'));
    await renderWithProviders(<CommentInput commentId="unchanged-comment" commentToUpdate="Same text" />);
    const input = screen.getByTestId(COMMENT_INPUT_TEST_ID);
    await user.press(screen.getByTestId(COMMENT_ICON_TEST_ID));

    await user.clear(input);
    await act(async () => {
      await input.props.onSubmitEditing();
    });
    expect(screen.queryByTestId(COMMENT_ICON_TEST_ID)).toBeNull();
  });
});
