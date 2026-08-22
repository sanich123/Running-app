import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { setUserId } from '@R/slices/auth/auth';
import {
  setCommentActivityId,
  setIdOfUpdatingComment,
  setIsShowingTextInput,
  setMapPhotoUrl,
} from '@R/slices/comment/comment';
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
    await waitFor(() => expect(requestBody).toEqual({ comment: 'A real test comment' }));
    expect(mockStore.getState().comment.isShowingTextInput).toBe(false);
  });

  it('closes the composer without sending an empty comment', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setIdOfUpdatingComment(''));
    mockStore.dispatch(setIsShowingTextInput(true));
    await renderWithProviders(<CommentInput commentId="" profile={MOCK_PROFILE} />);

    await user.press(screen.getByTestId('comment-input-cancel'));

    expect(mockStore.getState().comment).toEqual(
      expect.objectContaining({ idOfUpdatingComment: '', isShowingTextInput: false }),
    );
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
    await renderWithProviders(
      <CommentInput
        commentId="edit-comment"
        commentToUpdate="Old text"
        profile={{ ...MOCK_PROFILE, emailNotifications: false }}
      />,
    );
    expect(screen.getByText('Редактирование комментария')).toBeOnTheScreen();
    const input = screen.getByTestId(COMMENT_INPUT_TEST_ID);
    await user.clear(input);
    await user.type(input, '  Updated text  ');
    await user.press(screen.getByTestId(COMMENT_ICON_TEST_ID));

    await waitFor(() => expect(requestBody).toEqual({ comment: 'Updated text' }));
    expect(mockStore.getState().comment.isShowingTextInput).toBe(false);
  });

  it('does not send an unchanged or empty edited comment', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setCommentActivityId('unchanged-activity'));
    await renderWithProviders(
      <CommentInput commentId="unchanged-comment" commentToUpdate="Same text" profile={MOCK_PROFILE} />,
    );
    const input = screen.getByTestId(COMMENT_INPUT_TEST_ID);
    await user.press(screen.getByTestId(COMMENT_ICON_TEST_ID));
    expect(mockStore.getState().comment.isShowingTextInput).toBe(false);

    await user.clear(input);
    await act(async () => {
      await input.props.onSubmitEditing();
    });
    expect(screen.queryByTestId(COMMENT_ICON_TEST_ID)).toBeNull();
  });

  it('sends the optional email notification after publishing a comment', async () => {
    const user = userEvent.setup();
    let emailBody: unknown;
    mockStore.dispatch(setCommentActivityId('email-activity'));
    mockStore.dispatch(setMapPhotoUrl('https://cdn.example/map.jpg'));
    server.use(
      http.post(`${BASE_URL}/comment/email-activity`, () => HttpResponse.json({ id: 'new-comment' }, { status: 201 })),
      http.post(`${BASE_URL}/email/comment`, async ({ request }) => {
        emailBody = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );
    await renderWithProviders(
      <CommentInput
        commentId=""
        profile={{ ...MOCK_PROFILE, emailNotifications: true, users: { email: 'recipient@example.com' } }}
      />,
    );
    await user.type(screen.getByTestId(COMMENT_INPUT_TEST_ID), 'Notify the owner');
    await user.press(screen.getByTestId(COMMENT_ICON_TEST_ID));

    await waitFor(() =>
      expect(emailBody).toEqual(
        expect.objectContaining({
          comment: 'Notify the owner',
          recepientEmail: 'recipient@example.com',
          mapPhotoUrl: 'https://cdn.example/map.jpg',
        }),
      ),
    );
  });
});
