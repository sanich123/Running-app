import { runichApi } from '@R/runich-api/runich-api';
import { AccessData, EmailPasswordData, VerifyTokenRequest, VerifyTokenResponse } from './types';

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
    loginUserWithGoogle: mutation<AccessData, { email: string; name: string | null; photo: string | null }>({
      query: ({ email, name, photo }) => ({
        url: '/auth/login-with-google',
        body: { email, name, photo },
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
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLazyVerifyConfigQuery,
  useDeleteUserMutation,
  useConfirmSignUpCodeByEmailMutation,
  useLoginUserWithGoogleMutation,
} = authenticationApi;
