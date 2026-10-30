import { Methods, Routes, Tags } from '@R/runich-api/const';
import { createSearchParams } from '@R/runich-api/create-search-params';
import { runichApi } from '@R/runich-api/runich-api';
import type {
  CreateGroupRequest,
  CreateGroupEventRequest,
  CreateGroupPostRequest,
  GroupDetails,
  GroupEvent,
  GroupEventsQuery,
  GroupMember,
  GroupMemberUpdateResult,
  GroupMonthlyStatistics,
  GroupMonthlyStatisticsQuery,
  GroupPost,
  GroupSummary,
  GroupsQuery,
  UpdateGroupPreferencesRequest,
  UpdateGroupMemberRequest,
} from './types';

const groupsRoute = Routes.groups;

export const groupsApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ query, mutation }) => ({
    getGroups: query<GroupSummary[], GroupsQuery>({
      query: ({ scope = 'all', search, sport }) =>
        `/${groupsRoute}${createSearchParams({ scope, search: search?.trim() || undefined, sport })}`,
      providesTags: [Tags.groups],
    }),
    getGroupById: query<GroupDetails, string>({
      query: (id) => `/${groupsRoute}/${id}`,
      providesTags: [Tags.groups],
    }),
    getGroupMembers: query<GroupMember[], { groupId: string; status: 'active' | 'pending' }>({
      query: ({ groupId, status }) => `/${groupsRoute}/${groupId}/members${createSearchParams({ status })}`,
      providesTags: [Tags.groups],
    }),
    getGroupMonthlyStatistics: query<GroupMonthlyStatistics, GroupMonthlyStatisticsQuery>({
      query: ({ groupId, year, month, timeZone }) =>
        `/${groupsRoute}/${groupId}/statistics/month${createSearchParams({ year, month, timeZone })}`,
      providesTags: [Tags.groups],
    }),
    getGroupPosts: query<GroupPost[], string>({
      query: (groupId) => `/${groupsRoute}/${groupId}/posts`,
      providesTags: [Tags.groups],
    }),
    getGroupEvents: query<GroupEvent[], GroupEventsQuery>({
      query: ({ groupId, period }) => `/${groupsRoute}/${groupId}/events${createSearchParams({ period })}`,
      providesTags: [Tags.groups],
    }),
    createGroup: mutation<GroupDetails, CreateGroupRequest>({
      query: (body) => ({ url: `/${groupsRoute}`, method: Methods.post, body }),
      invalidatesTags: [Tags.groups],
    }),
    joinGroup: mutation<GroupDetails, string>({
      query: (id) => ({ url: `/${groupsRoute}/${id}/join`, method: Methods.post }),
      invalidatesTags: [Tags.groups],
    }),
    leaveGroup: mutation<void, string>({
      query: (id) => ({ url: `/${groupsRoute}/${id}/membership`, method: Methods.delete }),
      invalidatesTags: [Tags.groups],
    }),
    updateGroupMember: mutation<GroupMemberUpdateResult, UpdateGroupMemberRequest>({
      query: ({ groupId, userId, status }) => ({
        url: `/${groupsRoute}/${groupId}/members/${userId}`,
        method: Methods.patch,
        body: { status },
      }),
      invalidatesTags: [Tags.groups],
    }),
    updateGroupPreferences: mutation<
      Pick<UpdateGroupPreferencesRequest, 'notificationPreference' | 'feedPreference'>,
      UpdateGroupPreferencesRequest
    >({
      query: ({ groupId, notificationPreference, feedPreference }) => ({
        url: `/${groupsRoute}/${groupId}/preferences`,
        method: Methods.patch,
        body: { notificationPreference, feedPreference },
      }),
      invalidatesTags: [Tags.groups],
    }),
    createGroupPost: mutation<{ id: string }, CreateGroupPostRequest>({
      query: ({ groupId, text, photoAssetId }) => ({
        url: `/${groupsRoute}/${groupId}/posts`,
        method: Methods.post,
        body: { text, ...(photoAssetId ? { photoAssetId } : {}) },
      }),
      invalidatesTags: [Tags.groups],
    }),
    createGroupEvent: mutation<GroupEvent, CreateGroupEventRequest>({
      query: ({ groupId, ...body }) => ({ url: `/${groupsRoute}/${groupId}/events`, method: Methods.post, body }),
      invalidatesTags: [Tags.groups],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useGetGroupByIdQuery,
  useGetGroupMembersQuery,
  useGetGroupMonthlyStatisticsQuery,
  useGetGroupPostsQuery,
  useGetGroupEventsQuery,
  useCreateGroupMutation,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useUpdateGroupMemberMutation,
  useUpdateGroupPreferencesMutation,
  useCreateGroupPostMutation,
  useCreateGroupEventMutation,
} = groupsApi;
