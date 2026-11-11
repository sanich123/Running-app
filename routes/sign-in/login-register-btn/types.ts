import type { UseFormHandleSubmit } from 'react-hook-form';
import type { EmailPasswordData } from '@R/services/authentication/types';
import type { SignInPageStates } from '@U/validate-email-password';

export interface LoginRegisterBtnProps {
  handleSubmit: UseFormHandleSubmit<EmailPasswordData>;
  authStep?: SignInPageStates;
  legalConsentAccepted?: boolean;
  returnTo?: string;
}
