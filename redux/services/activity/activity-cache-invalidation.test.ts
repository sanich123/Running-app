import { configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import auth from '@R/slices/auth/auth';
import { MOCK_SERVER_IDS, MOCK_SERVER_STATISTICS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { server } from '@T/utils/server';
import { runichApi } from '../../runich-api/runich-api';
import '../statistics/statistics';
import './activity';

describe('activity cache invalidation', () => {
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
    const api = runichApi as any;
    const statisticsSubscription = store.dispatch(
      api.endpoints.getAnnualStatisticsByUserId.initiate({ userId: MOCK_SERVER_IDS.userId }),
    );

    await statisticsSubscription.unwrap();
    await store.dispatch(api.endpoints.deleteActivityById.initiate(MOCK_SERVER_IDS.activityId)).unwrap();

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
