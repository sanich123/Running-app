import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import type { UseFormHandleSubmit } from 'react-hook-form';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import {
  useGetEmailCodeForPasswordMutation,
  useLoginUserMutation,
  useRequestEmailLinkMutation,
  useRegisterUserMutation,
} from '@R/services/authentication/authentication';
import { setAccessToken, setRefreshToken, setUserId } from '@R/slices/auth/auth';
import { saveEmail, savePassword, setIsDisabledWhenLogining } from '@R/slices/logining/logining';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { SignInPageStates } from '@U/validate-email-password';
import { EMAIL_LINK_BTN, REGISTER_BTN, LOGIN_BTN, LoginBtnIcons, RESET_BTN } from './const';
import type { EmailPasswordData } from '@R/services/authentication/types';

export default function LoginRegisterBtn({
  handleSubmit,
  authStep = SignInPageStates.login,
}: {
  handleSubmit: UseFormHandleSubmit<EmailPasswordData>;
  authStep?: SignInPageStates;
}) {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { isDisabledWhenLogining } = useAppSelector(({ logining }) => logining);
  const { push, replace } = useRouter();
  const [loginUser, { isLoading: isLoginingUser }] = useLoginUserMutation();
  const [registerUser, { isLoading: isRegisteringUser }] = useRegisterUserMutation();
  const [getEmailCodeForPassword, { isLoading: isGettingPasswordCode }] = useGetEmailCodeForPasswordMutation();
  const [requestEmailLink, { isLoading: isRequestingEmailLink }] = useRequestEmailLinkMutation();
  const isSubmitting = isLoginingUser || isRegisteringUser || isGettingPasswordCode || isRequestingEmailLink;
  const confirmEmailPage = (email: string, type: 'registration' | 'change-password') => ({
    pathname: `/${ROUTES.confirmEmailCode}` as const,
    params: { email, type },
  });

  return (
    <Button
      testID="auth-submit"
      icon={LoginBtnIcons[authStep]}
      mode="contained"
      contentStyle={{ minHeight: 48 }}
      labelStyle={{ fontFamily: FONT_FAMILIES.semiBold }}
      style={{ borderRadius: 8, marginTop: 8 }}
      accessibilityRole="button"
      loading={isSubmitting}
      disabled={isDisabledWhenLogining}
      onPress={handleSubmit(async ({ email, password }: EmailPasswordData) => {
        dispatch(setIsDisabledWhenLogining(true));
        dispatch(saveEmail(email));
        dispatch(savePassword(password));
        if (authStep === SignInPageStates.emailLink) {
          return requestEmailLink({ email })
            .unwrap()
            .then(({ message }) => successToast(message))
            .catch((error) => errorToast('', error))
            .finally(() => dispatch(setIsDisabledWhenLogining(false)));
        }
        if (authStep === SignInPageStates.register) {
          return registerUser({ email, password })
            .unwrap()
            .then(() => push(confirmEmailPage(email, 'registration')))
            .catch((error) => errorToast('', error))
            .finally(() => dispatch(setIsDisabledWhenLogining(false)));
        }
        if (authStep === SignInPageStates.reset) {
          return getEmailCodeForPassword({ email })
            .unwrap()
            .then(() => push(confirmEmailPage(email, 'change-password')))
            .catch((error) => errorToast('', error))
            .finally(() => dispatch(setIsDisabledWhenLogining(false)));
        }
        if (authStep === SignInPageStates.login) {
          return await loginUser({ email, password })
            .unwrap()
            .then(({ userId, accessToken, refreshToken }) => {
              dispatch(setUserId(userId));
              dispatch(setAccessToken(accessToken));
              dispatch(setRefreshToken(refreshToken));
              replace(ROUTES.root);
            })
            .catch((error) => errorToast('', error))
            .finally(() => dispatch(setIsDisabledWhenLogining(false)));
        }
      })}>
      {!isSubmitting && authStep === SignInPageStates.register && REGISTER_BTN[language].register}
      {!isSubmitting && authStep === SignInPageStates.login && LOGIN_BTN[language].login}
      {!isSubmitting && authStep === SignInPageStates.reset && RESET_BTN[language].login}
      {!isSubmitting && authStep === SignInPageStates.emailLink && EMAIL_LINK_BTN[language].send}
    </Button>
  );
}
