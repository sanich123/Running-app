import { configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Routes } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import auth from '@R/slices/auth/auth';
import { MOCK_SERVER_FOLLOWINGS, MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { server } from '@T/utils/server';
import './followers';

describe('followers cache invalidation', () => {
  it('refreshes the following list after following a user', async () => {
    let followingRequests = 0;
    server.use(
      http.get(`${BASE_URL}/${Routes.friend}/${MOCK_SERVER_IDS.userId}`, () => {
        followingRequests += 1;
        return HttpResponse.json(MOCK_SERVER_FOLLOWINGS);
      }),
      http.post(`${BASE_URL}/${Routes.friend}/someFriendId`, () => HttpResponse.json({}, { status: 201 })),
    );
    const store = createStore();
    const api = runichApi as any;

    await store.dispatch(api.endpoints.getYouFollowUsersByUserId.initiate(MOCK_SERVER_IDS.userId)).unwrap();
    await store.dispatch(api.endpoints.addFriend.initiate({ id: 'someFriendId' })).unwrap();

    await waitFor(() => expect(followingRequests).toBe(2));
  });

  it('refreshes the following list after unfollowing a user', async () => {
    let followingRequests = 0;
    server.use(
      http.get(`${BASE_URL}/${Routes.friend}/${MOCK_SERVER_IDS.userId}`, () => {
        followingRequests += 1;
        return HttpResponse.json(MOCK_SERVER_FOLLOWINGS);
      }),
      http.delete(`${BASE_URL}/${Routes.friend}/:relationshipId`, () => new HttpResponse(null, { status: 204 })),
    );
    const store = createStore();
    const api = runichApi as any;

    await store.dispatch(api.endpoints.getYouFollowUsersByUserId.initiate(MOCK_SERVER_IDS.userId)).unwrap();
    await store.dispatch(api.endpoints.deleteFriend.initiate(MOCK_SERVER_FOLLOWINGS[0].id)).unwrap();

    await waitFor(() => expect(followingRequests).toBe(2));
  });
});

function createStore() {
  return configureStore({
    reducer: { auth, [runichApi.reducerPath]: runichApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(runichApi.middleware),
  });
}
