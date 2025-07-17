export type EmailPasswordData = {
  email: string;
  password: string;
};

export type AccessData = {
  id: string;
  accessToken: string;
};

export type VerifyTokenRequest = {
  accessToken: string;
};

export type VerifyTokenResponse = {
  id: string;
  appVersion: string;
  accessToken: string;
};
