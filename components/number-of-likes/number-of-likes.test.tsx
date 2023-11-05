import { screen } from '@testing-library/react-native';

import NumberOfLikes from './number-of-likes';
import * as auth from '../../auth/context/auth-context';
import { MOCK_LIKES } from '../../tests/mocks/mock-likes';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Number of likes', () => {
  it('should correctly renders, when you liked', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<NumberOfLikes likes={MOCK_LIKES} />, { store: mockStore });
    expect(screen.getByText(/you/i)).toBeOnTheScreen();
    expect(screen.getByText(/and/i)).toBeOnTheScreen();
    expect(screen.getByText(/8 gave likes/i)).toBeOnTheScreen();
  });
  it('should correctly renders, when you didnt like', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someWrongId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<NumberOfLikes likes={MOCK_LIKES} />, { store: mockStore });
    expect(screen.getByText(/9 gave likes/i)).toBeOnTheScreen();
  });
});
