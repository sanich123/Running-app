import { headers, Methods, Routes } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { EmailComment, EmailCommentLike, EmailLike } from './types';

const { email, comment, commentLike, like } = Routes;

const emailsApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    sendEmailAfterSendingLike: builder.mutation<void, EmailLike>({
      query: (body) => ({
        url: `/${email}/${like}`,
        method: Methods.post,
        headers,
        body,
      }),
    }),
    sendEmailAfterSendingComment: builder.mutation<void, EmailComment>({
      query: (body) => ({
        url: `/${email}/${comment}`,
        method: Methods.post,
        headers,
        body,
      }),
    }),
    sendEmailAfterSendingCommentLike: builder.mutation<void, EmailCommentLike>({
      query: (body) => ({
        url: `/${email}/${commentLike}`,
        method: Methods.post,
        headers,
        body,
      }),
    }),
  }),
});

export const {
  useSendEmailAfterSendingLikeMutation,
  useSendEmailAfterSendingCommentMutation,
  useSendEmailAfterSendingCommentLikeMutation,
} = emailsApi;
