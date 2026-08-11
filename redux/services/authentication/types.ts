export interface EmailPasswordData {
  email: string;
  password: string;
}

export interface AccessData {
  accessToken: string;
  refreshToken: string;
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

export interface ChangePasswordResponse {
  accessToken: string;
  userId?: string;
}

export interface AppConfig {
  appVersion: string;
}
