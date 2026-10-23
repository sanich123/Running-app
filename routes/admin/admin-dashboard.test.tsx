import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import AdminDashboard from './admin-dashboard';

const mockReplace = jest.fn();
const mockRouteParams = { current: {} };
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockRouteParams.current,
}));

const setAccess = (access: { roles: string[]; permissions: string[]; isSuperuser: boolean }) => {
  server.use(http.get(BASE_URL + '/admin/access', () => HttpResponse.json(access)));
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockReplace.mockClear();
  });

  it('redirects an account with no permissions to sign-in with the access request message', async () => {
    setAccess({ roles: [], permissions: [], isSuperuser: false });

    await renderWithProviders(<AdminDashboard />);

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/sign-in',
        params: { returnTo: '/admin', accessDenied: 'true' },
      }),
    );
  });

  it('shows a loading state while the backend checks permissions', async () => {
    let releaseAccess: (() => void) | undefined;
    const accessPending = new Promise<void>((resolve) => {
      releaseAccess = () => resolve();
    });
    server.use(
      http.get(BASE_URL + '/admin/access', async () => {
        await accessPending;
        return HttpResponse.json({ roles: ['email_sender'], permissions: ['email.send'], isSuperuser: false });
      }),
    );

    await renderWithProviders(<AdminDashboard />);

    expect(screen.getByTestId('admin-access-loading')).toBeOnTheScreen();
    releaseAccess?.();
    expect(
      await screen.findByText('У вас есть право отправлять email. Этот раздел админки пока не подключён.'),
    ).toBeOnTheScreen();
  });

  it('shows an error state when the backend cannot check admin access', async () => {
    server.use(
      http.get(BASE_URL + '/admin/access', () => HttpResponse.json({ message: 'Unavailable' }, { status: 503 })),
    );

    await renderWithProviders(<AdminDashboard />);

    expect(await screen.findByText('Повторить')).toBeOnTheScreen();
  });

  it('shows the email-only notice to a user with no connected admin section', async () => {
    setAccess({ roles: ['email_sender'], permissions: ['email.send'], isSuperuser: false });

    await renderWithProviders(<AdminDashboard />);

    expect(
      await screen.findByText('У вас есть право отправлять email. Этот раздел админки пока не подключён.'),
    ).toBeOnTheScreen();
  });

  it('shows moderation for a moderator', async () => {
    setAccess({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false });
    server.use(
      http.get(BASE_URL + '/moderation/reports', () => HttpResponse.json([])),
      http.get(BASE_URL + '/moderation/appeals', () => HttpResponse.json([])),
    );

    await renderWithProviders(<AdminDashboard />);

    expect(await screen.findByText('Модерация')).toBeOnTheScreen();
  });

  it('opens access management for an access manager and uses the selected language', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    setAccess({ roles: ['access_manager'], permissions: ['admin.roles.manage'], isSuperuser: false });
    server.use(
      http.get(BASE_URL + '/admin/users', () => HttpResponse.json([])),
      http.get(BASE_URL + '/admin/access-audit', () => HttpResponse.json([])),
    );

    await renderWithProviders(<AdminDashboard />);

    expect(await screen.findByText('User access')).toBeOnTheScreen();
    expect(screen.getByText('No users found.')).toBeOnTheScreen();
    expect(screen.getByText('No changes yet.')).toBeOnTheScreen();
  });

  it('opens access management by default for an access manager and switches sections for a superuser', async () => {
    const user = userEvent.setup();
    setAccess({
      roles: ['moderator', 'access_manager', 'superuser'],
      permissions: ['moderation.manage', 'admin.roles.manage', 'email.send'],
      isSuperuser: true,
    });
    server.use(
      http.get(BASE_URL + '/admin/users', () =>
        HttpResponse.json([{ id: 'user-2', email: 'user@example.test', roles: [] }]),
      ),
      http.get(BASE_URL + '/admin/access-audit', () => HttpResponse.json([])),
      http.get(BASE_URL + '/moderation/reports', () => HttpResponse.json([])),
      http.get(BASE_URL + '/moderation/appeals', () => HttpResponse.json([])),
    );

    await renderWithProviders(<AdminDashboard />);

    expect(await screen.findByTestId('admin-section-moderation')).toBeOnTheScreen();
    await user.press(screen.getByTestId('admin-section-access'));
    expect(await screen.findByText('Права пользователей')).toBeOnTheScreen();
    expect(screen.getByText('Суперпользователь')).toBeOnTheScreen();

    await user.press(screen.getByTestId('admin-section-moderation'));
    expect(await screen.findByText('Активных жалоб нет.')).toBeOnTheScreen();
  });
});
