import { screen } from '@testing-library/react-native';

import Feed from '../../app/(tabs)/home';
import * as auth from '../../auth/context/auth-context';
import { LANGUAGES } from '../../constants/enums';
import { formatDate, getHoursMinutes } from '../../utils/time-formatter';
import { MOCK_ACTIVITY } from '../mocks/mock-activity';
import { USER_AUTH_MOCKS } from '../mocks/use-auth';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: () => ({ granted: true }),
  requestBackgroundPermissionsAsync: () => ({ granted: true }),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => 'somePathname',
}));

describe('Home index', () => {
  it('should correctly renders from server', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<Feed />, { store: mockStore });
    expect(screen.getByTestId('homeActivityIndicator')).toBeOnTheScreen();
    expect(await screen.findByText('Moscow')).toBeOnTheScreen();
    expect(await screen.findByText('Искандер')).toBeOnTheScreen();
    expect(await screen.findByText('Ядгаров')).toBeOnTheScreen();
    expect(await screen.findByText(formatDate(new Date(MOCK_ACTIVITY.date), LANGUAGES.english))).toBeOnTheScreen();
    expect(await screen.findByText(getHoursMinutes(new Date(MOCK_ACTIVITY.date), LANGUAGES.english))).toBeOnTheScreen();
  });
  it('should correctly renders empty list', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserIdWithEmptyFriendsActivities',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<Feed />, { store: mockStore });
    expect(screen.getByTestId('homeActivityIndicator')).toBeOnTheScreen();
    expect(await screen.findByText('There will be yours and your friends activities...')).toBeOnTheScreen();
  });
  it('should correctly renders and error component, when an error occured', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someIdThatRejectsWithAnError',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<Feed />, { store: mockStore });
    expect(screen.getByTestId('homeActivityIndicator')).toBeOnTheScreen();
    expect(await screen.findByText('An error occured')).toBeOnTheScreen();
    expect(await screen.findByText('bad request, 401 code')).toBeOnTheScreen();
  });
});
