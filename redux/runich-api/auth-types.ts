export interface MessageResponse {
  message: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface ApiState {
  auth: {
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface UserAuthResponse extends AuthResponse {
  userId: string;
}

export interface LoginResponse extends UserAuthResponse {
  refreshToken: string;
}

export interface AppConfigResponse {
  appVersion: string;
}
