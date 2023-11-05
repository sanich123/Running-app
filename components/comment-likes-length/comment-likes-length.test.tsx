import { screen } from '@testing-library/react-native';

import CommentLikesLength from './comment-likes-length';
import * as auth from '../../auth/context/auth-context';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
describe('Comment likes length', () => {
  it('should correctly renders, when you and others gave likes', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '7857abb1-b125-4f39-becf-8f30216b46ec',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<CommentLikesLength id="922dca27-f99c-4165-96d6-5a04bbb6e9cb" />, { store: mockStore });
    expect(await screen.findByText(/you and 3 gave like/i)).toBeOnTheScreen();
  });
  it('should correctly renders, when you didnt like', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someWrongId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<CommentLikesLength id="922dca27-f99c-4165-96d6-5a04bbb6e9cb" />, { store: mockStore });
    expect(await screen.findByText(/4 gave like/i)).toBeOnTheScreen();
  });
});
