import { Methods, Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type {
  BlockedUsersResponse,
  ModerationActionRequest,
  ModerationAppealDecisionRequest,
  ModerationAppealItem,
  ModerationReportDetails,
  ModerationReportItem,
  SubmitContentReportRequest,
} from './types';

const { moderation } = Routes;

export const moderationApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ query, mutation }) => ({
    submitContentReport: mutation<void, SubmitContentReportRequest>({
      query: (body) => ({
        url: `/${moderation}/reports`,
        method: Methods.post,
        body,
      }),
    }),
    getModerationReports: query<ModerationReportItem[], { take?: number } | void>({
      query: (params) => ({ url: `/${moderation}/reports`, params: params ?? undefined }),
      providesTags: [Tags.moderationReports],
    }),
    getModerationReportDetails: query<ModerationReportDetails, string>({
      query: (reportId) => `/${moderation}/reports/${reportId}`,
      providesTags: (_result, _error, reportId) => [{ type: Tags.moderationReport, id: reportId }],
    }),
    applyModerationAction: mutation<ModerationReportItem, { reportId: string; request: ModerationActionRequest }>({
      query: ({ reportId, request }) => ({
        url: `/${moderation}/reports/${reportId}/actions`,
        method: Methods.post,
        body: request,
      }),
      invalidatesTags: (_result, _error, { reportId }) => [
        Tags.moderationReports,
        { type: Tags.moderationReport, id: reportId },
      ],
    }),
    getModerationAppeals: query<ModerationAppealItem[], { take?: number } | void>({
      query: (params) => ({ url: `/${moderation}/appeals`, params: params ?? undefined }),
      providesTags: [Tags.moderationAppeals],
    }),
    decideModerationAppeal: mutation<
      ModerationAppealItem,
      { appealId: string; request: ModerationAppealDecisionRequest }
    >({
      query: ({ appealId, request }) => ({
        url: `/${moderation}/appeals/${appealId}/decision`,
        method: Methods.post,
        body: request,
      }),
      invalidatesTags: [Tags.moderationReports, Tags.moderationAppeals, Tags.moderationReport],
    }),
    getBlockedUsers: query<BlockedUsersResponse, void>({
      query: () => `/${moderation}/blocks`,
      providesTags: [Tags.blockedUsers],
    }),
    blockUser: mutation<void, string>({
      query: (blockedUserId) => ({
        url: `/${moderation}/blocks/${blockedUserId}`,
        method: Methods.put,
      }),
      invalidatesTags: [
        Tags.blockedUsers,
        Tags.profile,
        Tags.activities,
        Tags.comments,
        Tags.commentCounts,
        Tags.commentLikes,
        Tags.likes,
        Tags.users,
        Tags.friends,
      ],
    }),
    unblockUser: mutation<void, string>({
      query: (blockedUserId) => ({
        url: `/${moderation}/blocks/${blockedUserId}`,
        method: Methods.delete,
      }),
      invalidatesTags: [
        Tags.blockedUsers,
        Tags.profile,
        Tags.activities,
        Tags.comments,
        Tags.commentCounts,
        Tags.commentLikes,
        Tags.likes,
        Tags.users,
        Tags.friends,
      ],
    }),
  }),
});

export const {
  useSubmitContentReportMutation,
  useGetModerationReportsQuery,
  useGetModerationReportDetailsQuery,
  useApplyModerationActionMutation,
  useGetModerationAppealsQuery,
  useDecideModerationAppealMutation,
  useGetBlockedUsersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
} = moderationApi;
