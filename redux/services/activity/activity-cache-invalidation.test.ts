import { createElement, useEffect, useRef } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import auth from '@R/slices/auth/auth';
import { MOCK_SERVER_IDS, MOCK_SERVER_STATISTICS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import {
  activityApi,
  useGetActivitiesWithRoutesInfiniteQuery,
  useGetFavoriteActivitiesInfiniteQuery,
} from './activity';
import { runichApi } from '../../runich-api/runich-api';
import { statisticsApi } from '../statistics/statistics';

function FavoriteActivitiesPaginationProbe() {
  const { isSuccess, fetchNextPage } = useGetFavoriteActivitiesInfiniteQuery();
  const fetchedNextPage = useRef(false);

  useEffect(() => {
    if (!isSuccess || fetchedNextPage.current) return;
    fetchedNextPage.current = true;
    void fetchNextPage();
  }, [fetchNextPage, isSuccess]);

  return null;
}

function RouteActivitiesPaginationProbe() {
  const { isSuccess, fetchNextPage } = useGetActivitiesWithRoutesInfiniteQuery({
    month: 10,
    search: 'run',
    timeZone: 'Europe/Moscow',
  });
  const fetchedNextPage = useRef(false);

  useEffect(() => {
    if (!isSuccess || fetchedNextPage.current) return;
    fetchedNextPage.current = true;
    void fetchNextPage();
  }, [fetchNextPage, isSuccess]);

  return null;
}

describe('activity cache invalidation', () => {
  it('requests route workouts with search and date filters, then follows the cursor', async () => {
    const requestedUrls: URL[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/with-routes`, ({ request }) => {
        const url = new URL(request.url);
        requestedUrls.push(url);
        const cursor = url.searchParams.get('cursor');
        return HttpResponse.json({
          activities: [],
          availableFilters: { years: [2026], months: [10], days: [31] },
          hasMore: cursor === null,
          nextCursor: cursor === null ? 'route-page-cursor' : null,
        });
      }),
    );
    mockStore.dispatch(runichApi.util.resetApiState());
    const { unmount } = await renderWithProviders(createElement(RouteActivitiesPaginationProbe), {
      store: mockStore,
    });

    await waitFor(() => expect(requestedUrls).toHaveLength(2));

    expect(requestedUrls[0]?.searchParams.get('search')).toBe('run');
    expect(requestedUrls[0]?.searchParams.get('month')).toBe('10');
    expect(requestedUrls[0]?.searchParams.get('timeZone')).toBe('Europe/Moscow');
    expect(requestedUrls[0]?.searchParams.get('cursor')).toBeNull();
    expect(requestedUrls[1]?.searchParams.get('cursor')).toBe('route-page-cursor');
    unmount();
  });

  it('requests the next favorite activity page with the returned cursor', async () => {
    const requestedCursors: (string | null)[] = [];
    server.use(
      http.get(BASE_URL + '/activity/favorites', ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        requestedCursors.push(cursor);
        return HttpResponse.json({
          activities: [],
          hasMore: cursor === null,
          nextCursor: cursor === null ? 'favorite-page-cursor' : null,
        });
      }),
    );
    mockStore.dispatch(runichApi.util.resetApiState());
    const { unmount } = await renderWithProviders(createElement(FavoriteActivitiesPaginationProbe), {
      store: mockStore,
    });

    await waitFor(() => expect(requestedCursors).toHaveLength(2));

    expect(requestedCursors).toEqual([null, 'favorite-page-cursor']);
    unmount();
  });

  it('refreshes annual statistics after deleting an activity', async () => {
    let statisticsRequests = 0;
    server.use(
      http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-category`, () => {
        statisticsRequests += 1;
        return HttpResponse.json(MOCK_SERVER_STATISTICS.year);
      }),
      http.delete(`${BASE_URL}/activity/:activityId`, () => new HttpResponse(null, { status: 204 })),
    );
    const store = createStore();
    const statisticsSubscription = store.dispatch(
      statisticsApi.endpoints.getAnnualStatisticsByUserId.initiate({ userId: MOCK_SERVER_IDS.userId }),
    );

    await statisticsSubscription.unwrap();
    await store.dispatch(activityApi.endpoints.deleteActivityById.initiate(MOCK_SERVER_IDS.activityId)).unwrap();

    await waitFor(() => expect(statisticsRequests).toBe(2));
    statisticsSubscription.unsubscribe();
  });
});

function createStore() {
  return configureStore({
    reducer: { auth, [runichApi.reducerPath]: runichApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(runichApi.middleware),
  });
}
