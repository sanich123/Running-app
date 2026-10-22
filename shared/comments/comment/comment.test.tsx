import { createRef } from 'react';
import type { RefObject } from 'react';
import { screen } from '@testing-library/react-native';
import { setIdOfUpdatingComment } from '@R/slices/comment/comment';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import Comment from './comment';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { CommentResponse } from '@R/runich-api/types';

jest.mock('@S/card/user-info/user-info', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="comment-author">author</Text>;
  },
}));
jest.mock('../comment-like-btn/comment-like-btn', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../comment-likes-length/comment-likes-length', () => ({
  __esModule: true,
  default: () => null,
}));

const commentProps: CommentResponse & { commentsModalRef: RefObject<BottomSheetModal | null> } = {
  authorId: 'user-1',
  comment: 'Отличная тренировка!',
  activityId: 'activity-1',
  id: 'comment-1',
  date: '2026-08-09T10:00:00.000Z',
  profileId: 'profile-1',
  profile: { name: 'Иван', surname: 'Иванов' },
  commentLike: [],
  commentsModalRef: createRef<BottomSheetModal>(),
};

describe('comment', () => {
  beforeEach(() => {
    mockStore.dispatch(setMockUserId(''));
    mockStore.dispatch(setIdOfUpdatingComment(''));
  });

  it('renders the comment and author actions only for its author', async () => {
    mockStore.dispatch(setMockUserId('user-1'));
    await renderWithProviders(<Comment {...commentProps} />);
    expect(screen.getByText('Отличная тренировка!')).toBeOnTheScreen();
    expect(screen.getByTestId('comment-author')).toBeOnTheScreen();
    expect(screen.getByTestId('edit-comment-comment-1')).toBeOnTheScreen();
    expect(screen.getByTestId('delete-comment-comment-1')).toBeOnTheScreen();
    expect(screen.queryByTestId('report-comment-comment-1')).toBeNull();
  });

  it('keeps the selected comment in the list while editing is rendered in the modal composer', async () => {
    mockStore.dispatch(setIdOfUpdatingComment('comment-1'));
    await renderWithProviders(<Comment {...commentProps} />);
    expect(screen.getByText('Отличная тренировка!')).toBeOnTheScreen();
    expect(screen.queryByTestId('comment-input')).not.toBeOnTheScreen();
  });
});
