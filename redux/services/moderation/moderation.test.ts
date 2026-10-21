import { http, HttpResponse } from 'msw';
import { runichApi } from '@R/runich-api/runich-api';
import { moderationApi } from '@R/services/moderation/moderation';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';

describe('moderation API', () => {
  beforeEach(() => mockStore.dispatch(runichApi.util.resetApiState()));

  it('loads report and appeal queues without optional page parameters', async () => {
    const requestedUrls: string[] = [];
    server.use(
      http.get(`${BASE_URL}/moderation/reports`, ({ request }) => {
        requestedUrls.push(request.url);
        return HttpResponse.json([]);
      }),
      http.get(`${BASE_URL}/moderation/appeals`, ({ request }) => {
        requestedUrls.push(request.url);
        return HttpResponse.json([]);
      }),
    );

    const reportQueue = mockStore.dispatch(moderationApi.endpoints.getModerationReports.initiate(undefined));
    const appealQueue = mockStore.dispatch(moderationApi.endpoints.getModerationAppeals.initiate(undefined));
    await expect(reportQueue.unwrap()).resolves.toEqual([]);
    await expect(appealQueue.unwrap()).resolves.toEqual([]);
    reportQueue.unsubscribe();
    appealQueue.unsubscribe();

    expect(requestedUrls).toEqual([`${BASE_URL}/moderation/reports`, `${BASE_URL}/moderation/appeals`]);
  });
});
