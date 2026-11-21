import type {
  AppConfigResponse,
  AuthResponse,
  LoginResponse,
  MessageResponse,
  UserAuthResponse,
} from '@R/runich-api/auth-types';

export interface EmailPasswordData {
  email: string;
  password: string;
}

export interface EmailData {
  email: string;
}

export interface VerifyLoginData {
  code: string;
}

export interface ProviderAccessToken {
  accessToken: string;
}

export interface NativeVkAuthCode {
  code: string;
  deviceId: string;
  codeVerifier: string;
  state: string;
  redirectUri?: string;
}

export interface NativeAppleAuthToken {
  identityToken: string;
  authorizationCode: string;
  nonce: string;
  givenName?: string;
  familyName?: string;
}

export interface VerifyPasswordChangeCodeData extends EmailData {
  confirmationCode: string;
}

export interface ChangePasswordData extends EmailData {
  password1: string;
  password2: string;
}

export type ChangePasswordResponse = UserAuthResponse & { refreshToken: string };

export type AppConfig = AppConfigResponse;
export type AuthTokenResponse = AuthResponse;
export type LoginUserResponse = LoginResponse;
export type MessageApiResponse = MessageResponse;

export type RegisterResponse = MessageResponse;
