import type { SignInPageStates } from '@U/validate-email-password';

export interface RegisterNavigationProps {
  authStep?: SignInPageStates;
  onAuthStepChange?: (step: SignInPageStates) => void;
  showEmailLinkNavigation?: boolean;
}
