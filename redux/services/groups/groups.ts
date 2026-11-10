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
  GroupPage,
  GroupMemberUpdateResult,
  GroupMonthlyStatisticsPage,
  GroupMonthlyStatisticsQuery,
  GroupPost,
  GroupSummary,
  GroupsQuery,
  UpdateGroupRequest,
  UpdateGroupMemberRequest,
} from './types';

const groupsRoute = Routes.groups;
const GROUP_PAGE_SIZE = 100;

const groupsApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ query, mutation, infiniteQuery }) => ({
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
    getGroupMembersInfinite: infiniteQuery<
      GroupPage<GroupMember>,
      { groupId: string; status: 'active' | 'pending' },
      string
    >({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: { groupId, status }, pageParam }) =>
        `/${groupsRoute}/${groupId}/members${createSearchParams({
          status,
          limit: GROUP_PAGE_SIZE,
          cursor: pageParam || undefined,
        })}`,
      providesTags: [Tags.groups],
    }),
    getGroupMonthlyStatisticsInfinite: infiniteQuery<GroupMonthlyStatisticsPage, GroupMonthlyStatisticsQuery, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: { groupId, year, month, timeZone }, pageParam }) =>
        `/${groupsRoute}/${groupId}/statistics/month${createSearchParams({
          year,
          month,
          timeZone,
          limit: GROUP_PAGE_SIZE,
          cursor: pageParam || undefined,
        })}`,
      providesTags: [Tags.groups],
    }),
    getGroupPostsInfinite: infiniteQuery<GroupPage<GroupPost>, string, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: groupId, pageParam }) =>
        `/${groupsRoute}/${groupId}/posts${createSearchParams({
          limit: GROUP_PAGE_SIZE,
          cursor: pageParam || undefined,
        })}`,
      providesTags: [Tags.groups],
    }),
    getGroupEvents: query<GroupEvent[], GroupEventsQuery>({
      query: ({ groupId, period }) => `/${groupsRoute}/${groupId}/events${createSearchParams({ period })}`,
      providesTags: [Tags.groups],
    }),
    getGroupEventsInfinite: infiniteQuery<GroupPage<GroupEvent>, GroupEventsQuery, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: { groupId, period }, pageParam }) =>
        `/${groupsRoute}/${groupId}/events${createSearchParams({
          period,
          limit: GROUP_PAGE_SIZE,
          cursor: pageParam || undefined,
        })}`,
      providesTags: [Tags.groups],
    }),
    createGroup: mutation<GroupDetails, CreateGroupRequest>({
      query: (body) => ({ url: `/${groupsRoute}`, method: Methods.post, body }),
      invalidatesTags: [Tags.groups],
    }),
    updateGroup: mutation<GroupDetails, UpdateGroupRequest>({
      query: ({ groupId, ...body }) => ({ url: `/${groupsRoute}/${groupId}`, method: Methods.patch, body }),
      invalidatesTags: [Tags.groups],
    }),
    deleteGroup: mutation<void, string>({
      query: (id) => ({ url: `/${groupsRoute}/${id}`, method: Methods.delete }),
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
  useGetGroupEventsQuery,
  useGetGroupMembersInfiniteInfiniteQuery: useGetGroupMembersInfiniteQuery,
  useGetGroupMonthlyStatisticsInfiniteInfiniteQuery: useGetGroupMonthlyStatisticsInfiniteQuery,
  useGetGroupPostsInfiniteInfiniteQuery: useGetGroupPostsInfiniteQuery,
  useGetGroupEventsInfiniteInfiniteQuery: useGetGroupEventsInfiniteQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useUpdateGroupMemberMutation,
  useCreateGroupPostMutation,
  useCreateGroupEventMutation,
} = groupsApi;
