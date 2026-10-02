import { Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { CurrentSubscriptionResponse } from './types';

const subscriptionApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ query }) => ({
    getCurrentSubscription: query<CurrentSubscriptionResponse, void>({
      query: () => '/subscription/me',
      providesTags: [Tags.subscription],
    }),
  }),
});

export const { useGetCurrentSubscriptionQuery } = subscriptionApi;
