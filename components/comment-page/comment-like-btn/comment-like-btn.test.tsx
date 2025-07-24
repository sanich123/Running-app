import { MOCK_LIKES } from '@T/mocks/mock-likes';
import { screen } from '@testing-library/react-native';
import CommentLikeBtn from './comment-like-btn';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { setUserId } from '@R/slices/auth/auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';

describe('Comment like btn', () => {
  it('should correctly renders, when liked by you', async () => {
    mockStore.dispatch(setUserId('7857abb1-b125-4f39-becf-8f30216b46ec'));
    renderWithProviders(
      <CommentLikeBtn
        commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb"
        commentLikesFromComment={MOCK_LIKES}
        comment={''}
        profile={MOCK_PROFILE}
      />,
      { store: mockStore },
    );
    expect(await screen.findByTestId('commentLikeBtn-active')).toBeOnTheScreen();
  });
  it('should correctly renders, when not liked by you', async () => {
    mockStore.dispatch(setUserId('someWrongId'));
    renderWithProviders(
      <CommentLikeBtn
        commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb"
        commentLikesFromComment={MOCK_LIKES}
        profile={MOCK_PROFILE}
        comment={''}
      />,
      { store: mockStore },
    );
    expect(await screen.findByTestId('commentLikeBtn')).toBeOnTheScreen();
  });
});
