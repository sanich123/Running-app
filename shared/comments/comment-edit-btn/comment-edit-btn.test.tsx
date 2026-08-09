import { screen, userEvent } from '@testing-library/react-native';
import { setIdOfUpdatingComment, setIsShowingTextInput } from '@R/slices/comment/comment';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentEditBtn from './comment-edit-btn';

describe('comment edit btn', () => {
  it('selects the comment and opens its editor', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setIdOfUpdatingComment(''));
    mockStore.dispatch(setIsShowingTextInput(false));
    await renderWithProviders(<CommentEditBtn idOfUpdatingComment="" commentId="comment-to-edit" />);
    await user.press(screen.getByRole('button'));
    expect(mockStore.getState().comment).toEqual(
      expect.objectContaining({ idOfUpdatingComment: 'comment-to-edit', isShowingTextInput: true }),
    );
  });
});
