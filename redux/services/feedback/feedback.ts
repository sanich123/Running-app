import { runichApi } from '@R/runich-api/runich-api';

export type FeedbackKind = 'bug' | 'feature' | 'question';
export type FeedbackTopic = 'account' | 'workout' | 'sync' | 'maps' | 'groups' | 'other';

export interface FeedbackAttachment {
  url: string;
  thumbnail: string | null;
}

export interface FeedbackRequest {
  feedbackId: string;
  kind: FeedbackKind;
  topic?: FeedbackTopic;
  text: string;
  deviceInfo: string;
  email?: string;
  attachments?: FeedbackAttachment[];
}

export interface FeedbackSubmissionResponse {
  id: string;
  email: string;
  confirmationEmailSent: boolean;
}

const feedbackApi = runichApi.injectEndpoints({
  endpoints: ({ mutation }) => ({
    sendFeedback: mutation<FeedbackSubmissionResponse, FeedbackRequest>({
      query: (body) => ({ url: '/email/feedback', method: 'POST', body }),
    }),
  }),
});

export const { useSendFeedbackMutation } = feedbackApi;
