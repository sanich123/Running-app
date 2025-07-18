import { runichApi } from '@R/runich-api/runich-api';
import { AccessData, EmailPasswordData, VerifyTokenRequest, VerifyTokenResponse } from './types';

export const authenticationApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: ({ mutation, query }) => ({
    registerUser: mutation<void, EmailPasswordData>({
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
  }),
});

export const { useRegisterUserMutation, useLoginUserMutation, useLazyVerifyConfigQuery, useDeleteUserMutation } =
  authenticationApi;
