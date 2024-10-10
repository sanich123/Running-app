import { Platform } from 'react-native';

import { ToastDuration, showCrossPlatformToast } from './custom-toast';
import { emailMatcher, passwordMatcher } from '../constants/regexp';

export type emailPasswordHandlerProps = {
  email: string;
  password: string;
  setEmailError: (arg: boolean) => void;
  setPasswordError: (arg: boolean) => void;
  action: SignInPageStates;
};

export function emailPasswordHandler({
  email,
  password,
  setEmailError,
  setPasswordError,
  action,
}: emailPasswordHandlerProps) {
  const passwordMatches = passwordMatcher.test(password);
  const emailMatches = emailMatcher.test(email.trim());

  if (!emailMatches || !passwordMatches) {
    if (!emailMatches) {
      if (Platform.OS !== 'web') {
        showCrossPlatformToast('Your email does not match the required pattern', ToastDuration.long);
      }
      setEmailError(true);
    } else {
      if (Platform.OS !== 'web') {
        showCrossPlatformToast('Your password should match the pattern', ToastDuration.long);
      }
      setPasswordError(true);
    }
    return emailMatches && passwordMatches;
  }

  if (!emailMatches) {
    if (Platform.OS !== 'web') {
      showCrossPlatformToast('Your email does not match the required pattern', ToastDuration.long);
    }
    setEmailError(true);
  }
  return emailMatches;
}

export const enum SignInPageStates {
  register = 'register',
  login = 'login',
}

export const signInMap = {
  [SignInPageStates.register]: SignInPageStates.login,
  [SignInPageStates.login]: SignInPageStates.register,
  // [SignInPageStates.reset]: SignInPageStates.register,
};
