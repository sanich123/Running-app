export type ConfirmEmailCodeType = 'registration' | 'change-password';

export interface ConfirmEmailCodeProps {
  email: string;
  type?: ConfirmEmailCodeType;
}
