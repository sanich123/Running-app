import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { changeLanguage } from '@R/slices/settings/settings';
import { ERROR_COMPONENT_COPY } from '@S/error-component/const';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { MODERATION_DASHBOARD_COPY } from '../profile/moderation/const';
import { ADMIN_ACCESS_COPY } from './admin-access-management/const';
import AdminDashboard from './admin-dashboard';
import { ADMIN_DASHBOARD_COPY } from './const';

const russianCopy = ADMIN_DASHBOARD_COPY[LANGUAGES.russian];

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
    expect(await screen.findByText(russianCopy.emailOnly)).toBeOnTheScreen();
  });

  it('shows an error state when the backend cannot check admin access', async () => {
    server.use(
      http.get(BASE_URL + '/admin/access', () => HttpResponse.json({ message: 'Unavailable' }, { status: 503 })),
    );

    await renderWithProviders(<AdminDashboard />);

    expect(await screen.findByText(ERROR_COMPONENT_COPY[LANGUAGES.russian].retry)).toBeOnTheScreen();
  });

  it('shows the email-only notice to a user with no connected admin section', async () => {
    setAccess({ roles: ['email_sender'], permissions: ['email.send'], isSuperuser: false });

    await renderWithProviders(<AdminDashboard />);

    expect(await screen.findByText(russianCopy.emailOnly)).toBeOnTheScreen();
  });

  it('shows the report queue for a moderator', async () => {
    setAccess({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false });
    server.use(
      http.get(BASE_URL + '/moderation/reports', () => HttpResponse.json([])),
      http.get(BASE_URL + '/moderation/appeals', () => HttpResponse.json([])),
    );

    await renderWithProviders(<AdminDashboard />);

    expect(await screen.findByText(MODERATION_DASHBOARD_COPY[LANGUAGES.russian].reports)).toBeOnTheScreen();
    expect(screen.getByText(MODERATION_DASHBOARD_COPY[LANGUAGES.russian].emptyReports)).toBeOnTheScreen();
  });

  it('opens access management for an access manager and uses the selected language', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    setAccess({ roles: ['access_manager'], permissions: ['admin.roles.manage'], isSuperuser: false });
    server.use(
      http.get(BASE_URL + '/admin/users', () => HttpResponse.json([])),
      http.get(BASE_URL + '/admin/access-audit', () => HttpResponse.json([])),
    );

    await renderWithProviders(<AdminDashboard />);

    const englishAccessCopy = ADMIN_ACCESS_COPY[LANGUAGES.english];
    expect(await screen.findByText(englishAccessCopy.title)).toBeOnTheScreen();
    expect(screen.getByText(englishAccessCopy.noUsers)).toBeOnTheScreen();
    expect(screen.getByText(englishAccessCopy.noAudit)).toBeOnTheScreen();
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
    expect(await screen.findByText(ADMIN_ACCESS_COPY[LANGUAGES.russian].title)).toBeOnTheScreen();
    await user.press(await screen.findByTestId('admin-edit-user-2'));
    expect(screen.getByText(ADMIN_ACCESS_COPY[LANGUAGES.russian].roles.superuser)).toBeOnTheScreen();
    await user.press(screen.getByTestId('admin-access-cancel'));

    await user.press(screen.getByTestId('admin-section-moderation'));
    expect(await screen.findByText(MODERATION_DASHBOARD_COPY[LANGUAGES.russian].emptyReports)).toBeOnTheScreen();
  });
});
