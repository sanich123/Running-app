import { screen } from '@testing-library/react-native';
import { setCommentToUpdate, setIdOfUpdatingComment } from '@R/slices/comment/comment';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentsListModal from './comments-list-modal';

let mockCommentsViewState: 'loading' | 'loaded' | 'empty' = 'loaded';

jest.mock('@S/comments/comments/comments', () => ({
  __esModule: true,
  default: function MockComments() {
    const { Text } = require('react-native');
    return mockCommentsViewState === 'loading' ? (
      <Text testID="comments-skeleton">skeleton</Text>
    ) : (
      <Text testID="comments-list">comments</Text>
    );
  },
}));
jest.mock('@S/comments/comment-input/comment-input', () => ({
  __esModule: true,
  default: ({ commentId, commentToUpdate }: { commentId: string; commentToUpdate?: string }) => {
    const { Text } = require('react-native');
    return (
      <Text testID="comments-input">
        {commentId}:{commentToUpdate}
      </Text>
    );
  },
}));
describe('comments list modal', () => {
  beforeEach(() => {
    mockCommentsViewState = 'loaded';
    mockStore.dispatch(setCommentToUpdate(''));
    mockStore.dispatch(setIdOfUpdatingComment(''));
  });

  it('shows a skeleton while comments are loading', async () => {
    mockCommentsViewState = 'loading';
    await renderWithProviders(<CommentsListModal commentsModalRef={{ current: null }} commentsLength={0} />);
    expect(screen.queryByTestId('comments-list')).not.toBeOnTheScreen();
    expect(screen.getByTestId('comments-skeleton')).toBeOnTheScreen();
    expect(screen.queryByText('Комментариев пока нет')).not.toBeOnTheScreen();
    expect(screen.getByTestId('comments-composer')).toBeOnTheScreen();
    expect(screen.getByTestId('comments-composer-keyboard-sticky').props.offset).toEqual({ opened: -8 });
    expect(screen.getByTestId('comments-input')).toBeOnTheScreen();
  });

  it('shows the comment input when there are no comments', async () => {
    mockCommentsViewState = 'empty';
    await renderWithProviders(<CommentsListModal commentsModalRef={{ current: null }} />);
    expect(screen.getByTestId('comments-composer')).toBeOnTheScreen();
    expect(screen.getByTestId('comments-input')).toBeOnTheScreen();
  });

  it('shows the comment input when the modal is opened', async () => {
    await renderWithProviders(<CommentsListModal commentsModalRef={{ current: null }} />);
    expect(screen.getByTestId('comments-list')).toBeOnTheScreen();
    expect(screen.getByTestId('comments-input')).toBeOnTheScreen();
  });

  it('renders the selected comment in the keyboard-aware composer for editing', async () => {
    mockStore.dispatch(setCommentToUpdate('Existing comment text'));
    mockStore.dispatch(setIdOfUpdatingComment('comment-id'));
    await renderWithProviders(<CommentsListModal commentsModalRef={{ current: null }} />);
    expect(screen.getByTestId('comments-input')).toHaveTextContent('comment-id:Existing comment text');
  });
});
