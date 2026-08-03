export interface EmailPasswordData {
  email: string;
  password: string;
}

export interface AccessData {
  id: string;
  accessToken: string;
}

export interface VerifyTokenRequest {
  accessToken: string;
}

export interface VerifyTokenResponse {
  id: string;
  appVersion: string;
  accessToken: string;
}
