import { screen, userEvent } from '@testing-library/react-native';

import CommentInput from './comment-input';
import { COMMENT_ICON_TEST_ID, COMMENT_INPUT_TEST_ID } from './const';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
jest.mock('../../auth/context/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'someUserId',
      app_metadata: {
        someProp: 'some value',
      },
      user_metadata: {
        someProp: 'some value',
      },
      aud: '',
      created_at: '',
    },
  }),
}));
describe('Comment input', () => {
  it('should correctly renders', () => {
    renderWithProviders(<CommentInput activityId="someActivityId" />, { store: mockStore });
    expect(screen.getByTestId(COMMENT_INPUT_TEST_ID)).toBeOnTheScreen();
  });
  it('should correctly change local state', async () => {
    renderWithProviders(<CommentInput activityId="someActivityId" />, { store: mockStore });
    const commentInput = screen.getByTestId(COMMENT_INPUT_TEST_ID);
    await userEvent.type(commentInput, 'some text');
    expect(commentInput.props.value).toEqual('some text');
    await userEvent.clear(commentInput);
    expect(commentInput.props.value).toEqual('');
  });
  it('should correctly renders comment sending icon', () => {
    renderWithProviders(<CommentInput activityId="someActivityId" />, { store: mockStore });
    const commentSendingIcon = screen.getByTestId(COMMENT_ICON_TEST_ID);
    expect(commentSendingIcon).toBeOnTheScreen();
  });
});
