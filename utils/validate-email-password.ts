import { ToastDuration, showCrossPlatformToast } from './custom-toast';
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
      showCrossPlatformToast('Your email does not match the required pattern', ToastDuration.long);
      setEmailError(true);
    } else {
      showCrossPlatformToast('Your password should match the pattern', ToastDuration.long);
      setPasswordError(true);
    }
  }
  return emailMatches && passwordMatches;
}
