import { ToastAndroid } from 'react-native';

import { emailMatcher, passwordMatcher } from '../constants/regexp';

export type emailPasswordHandlerProps = {
  email: string;
  password: string;
  setEmailError: (arg: boolean) => void;
  setPasswordError: (arg: boolean) => void;
};

export function emailPasswordHandler({ email, password, setEmailError, setPasswordError }: emailPasswordHandlerProps) {
  const passwordMatches = passwordMatcher.test(password);
  const emailMatches = emailMatcher.test(email.trim());
  if (!emailMatches || !passwordMatches) {
    if (!emailMatches) {
      ToastAndroid.show('Your email does not match the required pattern', ToastAndroid.SHORT);
      setEmailError(true);
    } else {
      ToastAndroid.show('Your password should match the pattern', ToastAndroid.SHORT);
      setPasswordError(true);
    }
  }
  return emailMatches && passwordMatches;
}
