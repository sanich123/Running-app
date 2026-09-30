import { runichApi } from '@R/runich-api/runich-api';

export interface FeedbackAttachment {
  url: string;
  thumbnail: string | null;
}

interface FeedbackRequest {
  feedbackId: string;
  kind: string;
  text: string;
  deviceInfo: string;
  attachments?: FeedbackAttachment[];
}

const feedbackApi = runichApi.injectEndpoints({
  endpoints: ({ mutation }) => ({
    sendFeedback: mutation<void, FeedbackRequest>({
      query: (body) => ({ url: '/email/feedback', method: 'POST', body }),
    }),
  }),
});

export const { useSendFeedbackMutation } = feedbackApi;
