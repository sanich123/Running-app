import { runichApi } from '@R/runich-api/runich-api';

export type FeedbackKind = 'bug' | 'thanks' | 'feature';

export const feedbackApi = runichApi.injectEndpoints({
  endpoints: ({ mutation }) => ({
    sendFeedback: mutation<void, FormData>({
      query: (body) => ({ url: '/email/feedback', method: 'POST', body }),
    }),
  }),
});

export const { useSendFeedbackMutation } = feedbackApi;
