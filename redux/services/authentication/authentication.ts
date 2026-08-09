import { runichApi } from '@R/runich-api/runich-api';
import type {
  AccessData,
  EmailPasswordData,
  RefreshTokenResponse,
  VerifyTokenRequest,
  VerifyTokenResponse,
} from './types';

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
    loginUser: mutation<AccessData, EmailPasswordData>({
      query: ({ email, password }) => ({
        url: '/auth/login',
        body: { email, password },
        method: 'POST',
      }),
    }),
    refreshToken: mutation<RefreshTokenResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: 'auth/refresh',
        body: { refreshToken },
        method: 'POST',
      }),
    }),
    verifyConfig: query<VerifyTokenResponse, VerifyTokenRequest>({
      query: ({ accessToken }) => ({
        url: 'auth/verify',
        body: { accessToken },
        method: 'POST',
      }),
    }),
    deleteUser: mutation<void, { userId: string }>({
      query: ({ userId }) => ({
        url: `auth/${userId}`,
        method: 'DELETE',
      }),
    }),
    confirmSignUpCodeByEmail: mutation<VerifyTokenResponse, { confirmationCode: string; email: string }>({
      query: ({ confirmationCode, email }) => ({
        url: 'auth/confirm-email',
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
