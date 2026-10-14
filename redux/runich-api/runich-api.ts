import { createApi } from '@reduxjs/toolkit/query/react';
import { API_NAME, baseQueryWithReauth, Tags } from './const';

export const runichApi = createApi({
  reducerPath: API_NAME,
  tagTypes: [
    Tags.activities,
    Tags.statistics,
    Tags.profile,
    Tags.comments,
    Tags.commentCounts,
    Tags.likes,
    Tags.friends,
    Tags.users,
    Tags.commentLikes,
    Tags.subscription,
    Tags.notifications,
  ],
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
