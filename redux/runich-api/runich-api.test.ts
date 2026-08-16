import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { router } from 'expo-router';
import { ROUTES } from '@const/enums';
import { setAccessToken, setRefreshToken } from '@R/slices/auth/actions';
import authReducer from '@R/slices/auth/auth';
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
    store.dispatch(setAccessToken('expired-access-token'));
    store.dispatch(setRefreshToken('expired-refresh-token'));

    await store.dispatch(navigationProbeApi.endpoints.navigationProbe.initiate('/navigation/unauthorized'));

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
