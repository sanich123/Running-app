import { runichApi } from '@R/runich-api/runich-api';
import type {
  AuthTokenResponse,
  ChangePasswordData,
  ChangePasswordResponse,
  AppConfig,
  EmailData,
  EmailPasswordData,
  LoginUserResponse,
  MessageApiResponse,
  RegisterResponse,
  VerifyPasswordChangeCodeData,
} from './types';

const authenticationApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ mutation, query }) => ({
    registerUser: mutation<RegisterResponse, EmailPasswordData>({
      query: ({ email, password }) => ({
        url: '/auth/register',
        body: { email, password },
        method: 'POST',
      }),
    }),
    loginUser: mutation<LoginUserResponse, EmailPasswordData>({
      query: ({ email, password }) => ({
        url: '/auth/login',
        body: { email, password },
        method: 'POST',
      }),
    }),
    requestEmailLink: mutation<MessageApiResponse, EmailData>({
      query: ({ email }) => ({
        url: '/auth/by-email-link',
        body: { email },
        method: 'POST',
      }),
    }),
    refreshToken: mutation<AuthTokenResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: '/auth/refresh',
        body: { refreshToken },
        method: 'POST',
      }),
    }),
    getAppConfig: query<AppConfig, void>({
      query: () => ({
        url: '/auth/config',
        method: 'GET',
      }),
    }),
    verifyConfig: query<LoginUserResponse, { accessToken: string }>({
      query: ({ accessToken }) => ({
        url: '/auth/verify',
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
    confirmSignUpCodeByEmail: mutation<LoginUserResponse, { confirmationCode: string; email: string }>({
      query: ({ confirmationCode, email }) => ({
        url: '/auth/confirm-email',
        body: { confirmationCode, email },
        method: 'POST',
      }),
    }),
    getEmailCodeForPassword: mutation<MessageApiResponse, EmailData>({
      query: ({ email }) => ({
        url: '/auth/get-email-code-for-password',
        body: { email },
        method: 'POST',
      }),
    }),
    verifyPasswordChangeCode: mutation<MessageApiResponse, VerifyPasswordChangeCodeData>({
      query: ({ email, confirmationCode }) => ({
        url: '/auth/verify-password-change-code',
        body: { email, confirmationCode },
        method: 'POST',
      }),
    }),
    changePassword: mutation<ChangePasswordResponse, ChangePasswordData>({
      query: ({ password1, password2, email }) => ({
        url: '/auth/change-password',
        body: { password1, password2, email },
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useRequestEmailLinkMutation,
  useGetAppConfigQuery,
  useLazyVerifyConfigQuery,
  useDeleteUserMutation,
  useConfirmSignUpCodeByEmailMutation,
  useGetEmailCodeForPasswordMutation,
  useVerifyPasswordChangeCodeMutation,
  useChangePasswordMutation,
} = authenticationApi;
