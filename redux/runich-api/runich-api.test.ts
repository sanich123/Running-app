import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { router } from 'expo-router';
import { ROUTES } from '@const/enums';
import authReducer, { setAuthTokens } from '@R/slices/auth/auth';
import { BASE_URL } from '@T/utils/handlers';
import { server } from '@T/utils/server';
import { runichApi } from './runich-api';

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));

const mockReplace = jest.fn();

const navigationProbeApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    navigationProbe: builder.query<unknown, string>({ query: (path) => path }),
  }),
});

describe('runich API navigation', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    jest.spyOn(router, 'replace').mockImplementation(mockReplace);
  });

  it('redirects to sign in when the refresh token cannot renew the session', async () => {
    server.use(
      http.get(`${BASE_URL}/navigation/unauthorized`, () => HttpResponse.json({ message: 'expired' }, { status: 401 })),
      http.post(`${BASE_URL}/auth/refresh`, () => HttpResponse.json({ message: 'expired' }, { status: 401 })),
    );
    const store = createApiStore();
    store.dispatch(setAuthTokens({ accessToken: 'expired-access-token', refreshToken: 'expired-refresh-token' }));

    await store.dispatch(navigationProbeApi.endpoints.navigationProbe.initiate('/navigation/unauthorized'));

    expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.signIn}`);
    expect(store.getState().auth.accessToken).toBe('');
  });

  it('rotates and persists both session tokens before retrying a protected request', async () => {
    let requestCount = 0;
    let refreshBody: unknown;
    server.use(
      http.get(`${BASE_URL}/navigation/refreshable`, ({ request }) => {
        requestCount += 1;
        if (requestCount === 1) {
          return HttpResponse.json({ message: 'expired' }, { status: 401 });
        }
        expect(request.headers.get('authorization')).toBe('Bearer renewed-access-token');
        return HttpResponse.json({ ok: true });
      }),
      http.post(`${BASE_URL}/auth/refresh`, async ({ request }) => {
        refreshBody = await request.json();
        return HttpResponse.json({ accessToken: 'renewed-access-token', refreshToken: 'renewed-refresh-token' });
      }),
    );
    const store = createApiStore();
    store.dispatch(setAuthTokens({ accessToken: 'expired-access-token', refreshToken: 'current-refresh-token' }));

    await store.dispatch(navigationProbeApi.endpoints.navigationProbe.initiate('/navigation/refreshable'));

    expect(refreshBody).toEqual({ refreshToken: 'current-refresh-token' });
    expect(store.getState().auth).toMatchObject({
      accessToken: 'renewed-access-token',
      refreshToken: 'renewed-refresh-token',
    });
    expect(requestCount).toBe(2);
  });

  it('keeps a stale session when refreshing it fails at the network level', async () => {
    server.use(
      http.get(`${BASE_URL}/navigation/network-error`, () =>
        HttpResponse.json({ message: 'expired' }, { status: 401 }),
      ),
      http.post(`${BASE_URL}/auth/refresh`, () => HttpResponse.error()),
    );
    const store = createApiStore();
    store.dispatch(setAuthTokens({ accessToken: 'expired-access-token', refreshToken: 'expired-refresh-token' }));

    await store.dispatch(navigationProbeApi.endpoints.navigationProbe.initiate('/navigation/network-error'));

    expect(mockReplace).not.toHaveBeenCalledWith(`/${ROUTES.signIn}`);
    expect(store.getState().auth).toMatchObject({
      accessToken: 'expired-access-token',
      refreshToken: 'expired-refresh-token',
    });
  });

  it('redirects to sign in when a protected request has no refresh token', async () => {
    server.use(
      http.get(`${BASE_URL}/navigation/no-refresh-token`, () =>
        HttpResponse.json({ message: 'expired' }, { status: 401 }),
      ),
    );
    const store = createApiStore();
    store.dispatch(setAuthTokens({ accessToken: 'expired-access-token' }));

    await store.dispatch(navigationProbeApi.endpoints.navigationProbe.initiate('/navigation/no-refresh-token'));

    expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.signIn}`);
    expect(store.getState().auth.accessToken).toBe('');
  });

  it('redirects to maintenance after a gateway failure', async () => {
    server.use(
      http.get(
        `${BASE_URL}/navigation/maintenance`,
        () => new HttpResponse('Bad Gateway', { status: 502, headers: { 'Content-Type': 'text/plain' } }),
      ),
    );
    const store = createApiStore();

    await store.dispatch(navigationProbeApi.endpoints.navigationProbe.initiate('/navigation/maintenance'));

    expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.maintenance}`);
  });
});

function createApiStore() {
  return configureStore({
    reducer: { auth: authReducer, [runichApi.reducerPath]: runichApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(runichApi.middleware),
  });
}
