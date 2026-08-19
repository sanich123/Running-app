import { runichApi } from '@R/runich-api/runich-api';

const feedbackApi = runichApi.injectEndpoints({
  endpoints: ({ mutation }) => ({
    sendFeedback: mutation<void, FormData>({
      query: (body) => ({ url: '/email/feedback', method: 'POST', body }),
    }),
  }),
});

export const { useSendFeedbackMutation } = feedbackApi;
