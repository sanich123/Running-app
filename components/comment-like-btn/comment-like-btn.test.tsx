import { screen } from '@testing-library/react-native';

import CommentLikeBtn from './comment-like-btn';
import * as auth from '../../auth/context/auth-context';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
describe('Comment like btn', () => {
  it('should correctly renders, when liked by you', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '7857abb1-b125-4f39-becf-8f30216b46ec',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<CommentLikeBtn commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb" />, { store: mockStore });
    expect(await screen.findByTestId('commentLikeBtn-active')).toBeOnTheScreen();
  });
  it('should correctly renders, when not liked by you', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someWrongId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<CommentLikeBtn commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb" />, { store: mockStore });
    expect(await screen.findByTestId('commentLikeBtn')).toBeOnTheScreen();
  });
});
