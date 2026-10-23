import { Methods, Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { AdminAccess, AdminAccessAuditItem, AdminRole, AdminUser } from './types';

const { admin } = Routes;

export const adminApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ query, mutation }) => ({
    getAdminAccess: query<AdminAccess, void>({
      query: () => `/${admin}/access`,
      providesTags: [Tags.adminAccess],
    }),
    getAdminUsers: query<AdminUser[], { email?: string; take?: number }>({
      query: (params) => ({ url: `/${admin}/users`, params }),
      providesTags: [Tags.adminUsers],
    }),
    getAdminAccessAudit: query<AdminAccessAuditItem[], { take?: number } | void>({
      query: (params) => ({ url: `/${admin}/access-audit`, params: params ?? undefined }),
      providesTags: [Tags.adminAccessAudit],
    }),
    grantAdminRole: mutation<void, { userId: string; role: AdminRole }>({
      query: ({ userId, role }) => ({
        url: `/${admin}/users/${userId}/roles/${role}`,
        method: Methods.put,
      }),
      invalidatesTags: [Tags.adminUsers, Tags.adminAccessAudit],
    }),
    revokeAdminRole: mutation<void, { userId: string; role: AdminRole }>({
      query: ({ userId, role }) => ({
        url: `/${admin}/users/${userId}/roles/${role}`,
        method: Methods.delete,
      }),
      invalidatesTags: [Tags.adminUsers, Tags.adminAccessAudit, Tags.adminAccess],
    }),
  }),
});

export const {
  useGetAdminAccessQuery,
  useGetAdminUsersQuery,
  useGetAdminAccessAuditQuery,
  useGrantAdminRoleMutation,
  useRevokeAdminRoleMutation,
} = adminApi;
