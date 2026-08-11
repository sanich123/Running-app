import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import type { UseFormHandleSubmit } from 'react-hook-form';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import {
  useGetEmailCodeForPasswordMutation,
  useLoginUserMutation,
  useRegisterUserMutation,
} from '@R/services/authentication/authentication';
import { saveEmail, savePassword, setIsDisabledWhenLogining } from '@R/slices/logining/logining';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { SignInPageStates } from '@U/validate-email-password';
import { REGISTER_BTN, LOGIN_BTN, LoginBtnIcons, RESET_BTN } from './const';
import type { EmailPasswordData } from '@R/services/authentication/types';

export default function LoginRegisterBtn({ handleSubmit }: { handleSubmit: UseFormHandleSubmit<EmailPasswordData> }) {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { pageState, isDisabledWhenLogining } = useAppSelector(({ logining }) => logining);
  const { push, replace } = useRouter();
  const [loginUser, { isLoading: isLoginingUser }] = useLoginUserMutation();
  const [registerUser, { isLoading: isRegisteringUser }] = useRegisterUserMutation();
  const [getEmailCodeForPassword, { isLoading: isGettingPasswordCode }] = useGetEmailCodeForPasswordMutation();
  const isSubmitting = isLoginingUser || isRegisteringUser || isGettingPasswordCode;
  const confirmEmailPage = (email: string, type: 'registration' | 'change-password') => ({
    pathname: `/${ROUTES.confirmEmailCode}` as const,
    params: { email, type },
  });

  return (
    <Button
      icon={LoginBtnIcons[pageState]}
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
        if (pageState === SignInPageStates.register) {
          return registerUser({ email, password })
            .unwrap()
            .then(() => push(confirmEmailPage(email, 'registration')))
            .catch((error) => errorToast('Во время регистрации произошла ошибка: ', error))
            .finally(() => dispatch(setIsDisabledWhenLogining(false)));
        }
        if (pageState === SignInPageStates.reset) {
          return getEmailCodeForPassword({ email })
            .unwrap()
            .then(() => push(confirmEmailPage(email, 'change-password')))
            .catch((error) => errorToast('Во время сброса пароля произошла ошибка: ', error))
            .finally(() => dispatch(setIsDisabledWhenLogining(false)));
        }
        if (pageState === SignInPageStates.login) {
          return await loginUser({ email, password })
            .unwrap()
            .then(() => replace(ROUTES.root))
            .catch((error) => errorToast('Во время авторизации произошла ошибка: ', error))
            .finally(() => dispatch(setIsDisabledWhenLogining(false)));
        }
      })}>
      {!isSubmitting && pageState === SignInPageStates.register && REGISTER_BTN[language].register}
      {!isSubmitting && pageState === SignInPageStates.login && LOGIN_BTN[language].login}
      {!isSubmitting && pageState === SignInPageStates.reset && RESET_BTN[language].login}
    </Button>
  );
}
