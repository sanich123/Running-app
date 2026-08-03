import { headers, Methods, Routes } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { EmailComment, EmailCommentLike, EmailDTO } from './types';

const { email, comment, commentLike, like } = Routes;

export const emailsApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    sendEmailAfterSendingLike: builder.mutation({
      query: (body: EmailDTO & { mapPhotoUrl: string }) => ({
        url: `/${email}/${like}`,
        method: Methods.post,
        headers,
        body,
      }),
    }),
    sendEmailAfterSendingComment: builder.mutation({
      query: (body: EmailComment) => ({
        url: `/${email}/${comment}`,
        method: Methods.post,
        headers,
        body,
      }),
    }),
    sendEmailAfterSendingCommentLike: builder.mutation({
      query: (body: EmailCommentLike) => ({
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
