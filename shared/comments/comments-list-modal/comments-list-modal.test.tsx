import { screen } from '@testing-library/react-native';
import { setIsShowingTextInput, setIdOfUpdatingComment } from '@R/slices/comment/comment';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentsListModal from './comments-list-modal';
import type { CommentsViewState } from '../types';

let mockCommentsViewState: CommentsViewState = 'loaded';

jest.mock('@S/comments/comments/comments', () => ({
  __esModule: true,
  default: function MockComments({ onViewStateChange }: { onViewStateChange?: (state: CommentsViewState) => void }) {
    const { Text } = require('react-native');
    const { useEffect } = require('react');
    useEffect(() => onViewStateChange?.(mockCommentsViewState), [onViewStateChange]);
    return mockCommentsViewState === 'loading' ? null : <Text testID="comments-list">comments</Text>;
  },
}));
jest.mock('@S/comments/comment-input/comment-input', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="comments-input">input</Text>;
  },
}));
describe('comments list modal', () => {
  beforeEach(() => {
    mockCommentsViewState = 'loaded';
    mockStore.dispatch(setIsShowingTextInput(false));
    mockStore.dispatch(setIdOfUpdatingComment(''));
  });

  it('uses the known empty state while comments are loading', async () => {
    mockCommentsViewState = 'loading';
    await renderWithProviders(<CommentsListModal commentsModalRef={{ current: null }} commentsLength={0} />);
    expect(screen.queryByTestId('comments-list')).not.toBeOnTheScreen();
    expect(screen.getByText('Комментариев пока нет')).toBeOnTheScreen();
    expect(screen.getByTestId('comments-composer')).toBeOnTheScreen();
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

  it('keeps the composer hidden while an existing comment is edited inline', async () => {
    mockStore.dispatch(setIdOfUpdatingComment('comment-id'));
    await renderWithProviders(<CommentsListModal commentsModalRef={{ current: null }} />);
    expect(screen.queryByTestId('comments-input')).not.toBeOnTheScreen();
  });
});
