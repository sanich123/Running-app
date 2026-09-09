import { screen, userEvent } from '@testing-library/react-native';
import { setCommentToUpdate, setIdOfUpdatingComment } from '@R/slices/comment/comment';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentAddBtn from './comment-add-btn';

describe('comment add btn', () => {
  it('opens a blank comment editor', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setCommentToUpdate('Old comment text'));
    mockStore.dispatch(setIdOfUpdatingComment('old-comment-id'));
    await renderWithProviders(<CommentAddBtn />);
    await user.press(screen.getByTestId('floatingBtn'));
    expect(mockStore.getState().comment.idOfUpdatingComment).toBe('');
    expect(mockStore.getState().comment.commentToUpdate).toBe('');
  });
});
