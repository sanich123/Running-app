import { http, HttpResponse } from 'msw';
import { router } from 'expo-router';
import { ROUTES } from '@const/enums';
import { resetAuthSlice, setAuthTokens } from '@R/slices/auth/auth';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { baseQueryWithReauth, PUBLIC_AUTH_ENDPOINTS } from './const';
import type { BaseQueryApi } from '@reduxjs/toolkit/query/react';

function createApi(endpoint = 'testEndpoint') {
  return {
    signal: new AbortController().signal,
    abort: jest.fn(),
    dispatch: mockStore.dispatch,
    getState: mockStore.getState,
    extra: undefined,
    endpoint,
    type: 'query',
    forced: false,
    queryCacheKey: 'test-query',
  } as unknown as BaseQueryApi;
}

describe('base query authentication and gateway handling', () => {
  beforeEach(() => {
    mockStore.dispatch(resetAuthSlice());
    jest.clearAllMocks();
    jest.spyOn(router, 'replace').mockImplementation(jest.fn());
  });

  afterEach(() => {
    mockStore.dispatch(resetAuthSlice());
    jest.restoreAllMocks();
  });

  it('does not attempt refresh for public authentication endpoints', async () => {
    server.use(http.get(`${BASE_URL}/public-route`, () => new HttpResponse(null, { status: 401 })));
    const result = await baseQueryWithReauth('public-route', createApi('loginUser'), {});

    expect(result.error?.status).toBe(401);
    expect(PUBLIC_AUTH_ENDPOINTS.has('loginUser')).toBe(true);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('clears auth and sends the user to sign-in when a private request has no refresh token', async () => {
    mockStore.dispatch(setAuthTokens({ accessToken: 'expired-token' }));
    server.use(http.get(`${BASE_URL}/private-route`, () => new HttpResponse(null, { status: 401 })));

    const result = await baseQueryWithReauth('private-route', createApi(), {});

    expect(result.error?.status).toBe(401);
    expect(mockStore.getState().auth.accessToken).toBe('');
    expect(router.replace).toHaveBeenCalledWith(`/${ROUTES.signIn}`);
  });

  it('refreshes an expired token once and retries the original request', async () => {
    mockStore.dispatch(setAuthTokens({ accessToken: 'expired-token', refreshToken: 'refresh-token' }));
    let privateRequestCount = 0;
    server.use(
      http.get(`${BASE_URL}/private-route`, () => {
        privateRequestCount += 1;
        return privateRequestCount === 1 ? new HttpResponse(null, { status: 401 }) : HttpResponse.json({ ok: true });
      }),
      http.post(`${BASE_URL}/auth/refresh`, () =>
        HttpResponse.json({ accessToken: 'new-token', refreshToken: 'new-refresh-token' }),
      ),
    );

    const result = await baseQueryWithReauth('private-route', createApi(), {});

    expect(result.data).toEqual({ ok: true });
    expect(privateRequestCount).toBe(2);
    expect(mockStore.getState().auth).toMatchObject({
      accessToken: 'new-token',
      refreshToken: 'new-refresh-token',
    });
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('waits for an in-flight refresh before retrying another expired request', async () => {
    mockStore.dispatch(setAuthTokens({ accessToken: 'expired-token', refreshToken: 'refresh-token' }));
    let firstRequestCount = 0;
    let secondRequestCount = 0;
    let refreshRequestCount = 0;
    let initialRequestCount = 0;
    let resolveInitialRequests!: () => void;
    const initialRequestsReceived = new Promise<void>((resolve) => {
      resolveInitialRequests = resolve;
    });
    let resolveRefreshStarted!: () => void;
    const refreshStarted = new Promise<void>((resolve) => {
      resolveRefreshStarted = resolve;
    });
    let releaseRefresh!: () => void;
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });
    server.use(
      http.get(`${BASE_URL}/private-first`, () => {
        firstRequestCount += 1;
        if (firstRequestCount > 1) return HttpResponse.json({ ok: true });
        initialRequestCount += 1;
        if (initialRequestCount === 2) resolveInitialRequests();
        return initialRequestsReceived.then(() => new HttpResponse(null, { status: 401 }));
      }),
      http.get(`${BASE_URL}/private-second`, () => {
        secondRequestCount += 1;
        if (secondRequestCount > 1) return HttpResponse.json({ ok: true });
        initialRequestCount += 1;
        if (initialRequestCount === 2) resolveInitialRequests();
        return initialRequestsReceived.then(() => new HttpResponse(null, { status: 401 }));
      }),
      http.post(`${BASE_URL}/auth/refresh`, async () => {
        refreshRequestCount += 1;
        resolveRefreshStarted();
        await refreshGate;
        return HttpResponse.json({ accessToken: 'new-token', refreshToken: 'new-refresh-token' });
      }),
    );

    const results = Promise.all([
      baseQueryWithReauth('private-first', createApi(), {}),
      baseQueryWithReauth('private-second', createApi(), {}),
    ]);
    await refreshStarted;
    releaseRefresh();
    const [firstResult, secondResult] = await results;

    expect(firstResult.data).toEqual({ ok: true });
    expect(secondResult.data).toEqual({ ok: true });
    expect(firstRequestCount).toBe(2);
    expect(secondRequestCount).toBe(2);
    expect(refreshRequestCount).toBe(1);
  });

  it('logs out when token refresh is rejected and returns a non-auth refresh error intact', async () => {
    mockStore.dispatch(setAuthTokens({ accessToken: 'expired-token', refreshToken: 'invalid-refresh-token' }));
    server.use(
      http.get(`${BASE_URL}/private-route`, () => new HttpResponse(null, { status: 401 })),
      http.post(`${BASE_URL}/auth/refresh`, () => new HttpResponse(null, { status: 401 })),
    );

    const rejectedRefresh = await baseQueryWithReauth('private-route', createApi(), {});
    expect(rejectedRefresh.error?.status).toBe(401);
    expect(mockStore.getState().auth.accessToken).toBe('');
    expect(router.replace).toHaveBeenCalledWith(`/${ROUTES.signIn}`);

    jest.clearAllMocks();
    mockStore.dispatch(setAuthTokens({ accessToken: 'expired-token', refreshToken: 'refresh-token' }));
    server.use(
      http.post(`${BASE_URL}/auth/refresh`, () =>
        HttpResponse.json({ message: 'temporarily unavailable' }, { status: 503 }),
      ),
    );

    const failedRefresh = await baseQueryWithReauth('private-route', createApi(), {});
    expect(failedRefresh.error?.status).toBe(503);
    expect(mockStore.getState().auth.accessToken).toBe('expired-token');
    expect(router.replace).toHaveBeenCalledWith(`/${ROUTES.maintenance}`);
  });

  it.each([502, 503])('routes to maintenance mode after an HTTP %s gateway failure', async (status) => {
    server.use(http.get(`${BASE_URL}/gateway`, () => new HttpResponse(null, { status })));
    const result = await baseQueryWithReauth('gateway', createApi(), {});

    expect(result.error?.status).toBe(status);
    expect(router.replace).toHaveBeenCalledWith(`/${ROUTES.maintenance}`);
  });

  it.each([502, 503])('routes to maintenance mode for an invalid JSON HTTP %s gateway response', async (status) => {
    server.use(http.get(`${BASE_URL}/gateway`, () => new HttpResponse('not json', { status })));
    const result = await baseQueryWithReauth('gateway', createApi(), {});

    expect(result.error?.status).toBe('PARSING_ERROR');
    expect(router.replace).toHaveBeenCalledWith(`/${ROUTES.maintenance}`);
  });
});
