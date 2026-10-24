import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import AdminAccessManagement from './admin-access-management';

describe('AdminAccessManagement', () => {
  beforeEach(() => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setMockUserId('manager-1'));
  });

  it('searches by a normalized partial email, edits permissions in a dialog, and saves the role changes', async () => {
    const user = userEvent.setup();
    const searchedEmails: string[] = [];
    const grantedRoles: string[] = [];
    server.use(
      http.get(BASE_URL + '/admin/users', ({ request }) => {
        const email = new URL(request.url).searchParams.get('email');
        if (email) searchedEmails.push(email);
        return HttpResponse.json([{ id: 'user-2', email: 'target@example.test', roles: [] }]);
      }),
      http.get(BASE_URL + '/admin/access-audit', () => HttpResponse.json([])),
      http.put(BASE_URL + '/admin/users/:id/roles/:role', ({ params }) => {
        grantedRoles.push(String(params.role));
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await renderWithProviders(<AdminAccessManagement isSuperuser={false} />);
    await screen.findByTestId('admin-user-user-2');
    await user.type(screen.getByTestId('admin-user-search'), ' Target@Example ');
    await user.press(screen.getByText('Найти'));
    await user.press(await screen.findByTestId('admin-edit-user-2'));
    await user.press(await screen.findByTestId('admin-role-moderator-user-2'));
    await user.press(screen.getByTestId('admin-access-save'));

    await waitFor(() => expect(searchedEmails).toContain('target@example'));
    await waitFor(() => expect(grantedRoles).toEqual(['moderator']));
    expect(screen.getByText('Модерация контента')).toBeOnTheScreen();
  });

  it('lets a superuser revoke a role and displays audit events', async () => {
    const user = userEvent.setup();
    const revokedRoles: string[] = [];
    server.use(
      http.get(BASE_URL + '/admin/users', () =>
        HttpResponse.json([{ id: 'user-2', email: 'target@example.test', roles: ['moderator'] }]),
      ),
      http.get(BASE_URL + '/admin/access-audit', () =>
        HttpResponse.json([
          {
            id: 'audit-1',
            actorEmail: 'admin@example.test',
            targetEmail: 'target@example.test',
            role: 'moderator',
            action: 'granted',
            createdAt: '2026-10-22T12:00:00.000Z',
          },
        ]),
      ),
      http.delete(BASE_URL + '/admin/users/:id/roles/:role', ({ params }) => {
        revokedRoles.push(String(params.role));
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await renderWithProviders(<AdminAccessManagement isSuperuser />);
    await user.press(await screen.findByTestId('admin-edit-user-2'));
    await user.press(await screen.findByTestId('admin-role-moderator-user-2'));
    await user.press(screen.getByTestId('admin-access-save'));

    await waitFor(() => expect(revokedRoles).toEqual(['moderator']));
    expect(screen.getByText('Модерация контента · target@example.test')).toBeOnTheScreen();
    expect(screen.getByText('Управление правами')).toBeOnTheScreen();
    expect(screen.getByText('Суперпользователь')).toBeOnTheScreen();
    expect(screen.getByText(/admin@example\.test/)).toBeOnTheScreen();
  });

  it('limits an access manager to moderator and email roles, disables editing their own access, and shows empty states', async () => {
    mockStore.dispatch(setMockUserId('user-1'));
    server.use(
      http.get(BASE_URL + '/admin/users', () =>
        HttpResponse.json([{ id: 'user-1', email: 'manager@example.test', roles: ['access_manager'] }]),
      ),
      http.get(BASE_URL + '/admin/access-audit', () => HttpResponse.json([])),
    );

    await renderWithProviders(<AdminAccessManagement isSuperuser={false} />);

    expect(await screen.findByTestId('admin-edit-user-1')).toBeDisabled();
    expect(screen.queryByTestId('admin-role-moderator-user-1')).toBeNull();
    expect(screen.getByText('Изменений пока нет.')).toBeOnTheScreen();
  });

  it('shows loading indicators and then the empty states when the admin lists are empty', async () => {
    let finishUsers: (() => void) | undefined;
    let finishAudit: (() => void) | undefined;
    const usersPending = new Promise<void>((resolve) => {
      finishUsers = () => resolve();
    });
    const auditPending = new Promise<void>((resolve) => {
      finishAudit = () => resolve();
    });
    server.use(
      http.get(BASE_URL + '/admin/users', async () => {
        await usersPending;
        return HttpResponse.json([]);
      }),
      http.get(BASE_URL + '/admin/access-audit', async () => {
        await auditPending;
        return HttpResponse.json([]);
      }),
    );

    await renderWithProviders(<AdminAccessManagement isSuperuser={false} />);

    expect(screen.getByTestId('admin-users-loading')).toBeOnTheScreen();
    expect(screen.getByTestId('admin-audit-loading')).toBeOnTheScreen();
    finishUsers?.();
    finishAudit?.();
    expect(await screen.findByText('Пользователи не найдены.')).toBeOnTheScreen();
    expect(screen.getByText('Изменений пока нет.')).toBeOnTheScreen();
  });

  it('uses English copy and reports a failed role update without changing the role', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    server.use(
      http.get(BASE_URL + '/admin/users', () =>
        HttpResponse.json([{ id: 'user-2', email: 'target@example.test', roles: [] }]),
      ),
      http.get(BASE_URL + '/admin/access-audit', () =>
        HttpResponse.json([
          {
            id: 'audit-2',
            actorEmail: 'admin@example.test',
            targetEmail: 'target@example.test',
            role: 'moderator',
            action: 'revoked',
            createdAt: '2026-10-22T12:00:00.000Z',
          },
        ]),
      ),
      http.put(BASE_URL + '/admin/users/:id/roles/:role', () =>
        HttpResponse.json({ message: 'Forbidden' }, { status: 403 }),
      ),
    );

    await renderWithProviders(<AdminAccessManagement isSuperuser={false} />);
    await user.press(await screen.findByTestId('admin-edit-user-2'));
    await user.press(await screen.findByTestId('admin-role-moderator-user-2'));
    await user.press(screen.getByTestId('admin-access-save'));

    expect(await screen.findByText('User access')).toBeOnTheScreen();
    expect(screen.getByText(/Revoked by admin@example\.test/)).toBeOnTheScreen();
    expect(screen.getByText('Content moderation')).toBeOnTheScreen();
  });
});
