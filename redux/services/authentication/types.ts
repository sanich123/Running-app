import type {
  AppConfigResponse,
  AuthResponse,
  LoginResponse,
  MessageResponse,
  UserAuthResponse,
} from '@R/runich-api/types';

export interface EmailPasswordData {
  email: string;
  password: string;
}

export interface EmailData {
  email: string;
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
