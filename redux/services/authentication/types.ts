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

/**
 * The backend currently returns a full Users row when an unconfirmed account
 * is registered again, and a message for a new account.
 */
interface ExistingRegistrationResponse {
  id: string;
  email: string;
  instance_id: string | null;
  aud: string | null;
  role: string | null;
  encrypted_password: string | null;
  email_confirmed_at: string | null;
  invited_at: string | null;
  confirmation_token: string | null;
  confirmation_sent_at: string | null;
  recovery_token: string | null;
  recovery_sent_at: string | null;
  email_change_token_new: string | null;
  email_change: string | null;
  email_change_sent_at: string | null;
  last_sign_in_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  phone: string | null;
  phone_confirmed_at: string | null;
  phone_change: string | null;
  phone_change_token: string | null;
  phone_change_sent_at: string | null;
  email_change_token_current: string | null;
  email_change_confirm_status: number | null;
  banned_until: string | null;
}

export type RegisterResponse = MessageResponse | ExistingRegistrationResponse;
