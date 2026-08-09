export interface EmailPasswordData {
  email: string;
  password: string;
}

export interface AccessData {
  id: string;
  accessToken?: string;
  access?: string;
  refreshToken?: string;
  refresh?: string;
}

export interface RefreshTokenResponse {
  accessToken?: string;
  access?: string;
  refreshToken?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface VerifyTokenRequest {
  accessToken: string;
}

export interface VerifyTokenResponse {
  id: string;
  appVersion: string;
  accessToken: string;
  refreshToken?: string;
  refresh?: string;
  access?: string;
}
