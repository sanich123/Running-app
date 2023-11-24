import { screen, userEvent } from '@testing-library/react-native';

import CommentInput from '../../components/comment-input/comment-input';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

describe('Comment input', () => {
  it('should correctly renders', () => {
    renderWithProviders(<CommentInput activityId="someActivityId" />, { store: mockStore });
    expect(screen.getByTestId('commentInput')).toBeOnTheScreen();
  });
  it('should correctly change local state', async () => {
    renderWithProviders(<CommentInput activityId="someActivityId" />, { store: mockStore });
    const commentInput = screen.getByTestId('commentInput');
    await userEvent.type(commentInput, 'some text');
    expect(commentInput.props.value).toEqual('some text');
    await userEvent.clear(commentInput);
    expect(commentInput.props.value).toEqual('');
  });
  it('should correctly renders comment sending icon', () => {
    renderWithProviders(<CommentInput activityId="someActivityId" />, { store: mockStore });
    const commentSendingIcon = screen.getByTestId('commentInputIcon');
    expect(commentSendingIcon).toBeOnTheScreen();
  });
});
