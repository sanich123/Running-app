import { runichApi } from '@R/runich-api/runich-api';
import type { EmailPasswordData } from './types';

export const authenticationApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ mutation, query }) => ({
    registerUser: mutation<{ message: string }, EmailPasswordData>({
      query: ({ email, password }) => ({
        url: '/auth/register',
        body: { email, password },
        method: 'POST',
      }),
    }),
    loginUser: mutation<{ accessToken: string; refreshToken: string; userId: string }, EmailPasswordData>({
      query: ({ email, password }) => ({
        url: '/auth/login',
        body: { email, password },
        method: 'POST',
      }),
    }),
    refreshToken: mutation<{ accessToken: string }, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: '/auth/refresh',
        body: { refreshToken },
        method: 'POST',
      }),
    }),
    verifyConfig: query<{ accessToken: string; userId: string }, { accessToken: string }>({
      query: ({ accessToken }) => ({
        url: 'auth/verify',
        body: { accessToken },
        method: 'POST',
      }),
    }),
    deleteUser: mutation<void, { userId: string }>({
      query: ({ userId }) => ({
        url: `/auth/${userId}`,
        method: 'DELETE',
      }),
    }),
    confirmSignUpCodeByEmail: mutation<
      { accessToken: string; id: string; userId: string },
      { confirmationCode: string; email: string }
    >({
      query: ({ confirmationCode, email }) => ({
        url: '/auth/confirm-email',
        body: { confirmationCode, email },
        method: 'POST',
      }),
    }),
    resetPassword: mutation<{ message: string }, { email: string }>({
      query: ({ email }: { email: string }) => ({
        url: 'auth/reset-password',
        body: { email },
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLazyVerifyConfigQuery,
  useDeleteUserMutation,
  useConfirmSignUpCodeByEmailMutation,
} = authenticationApi;
