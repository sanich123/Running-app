import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import type { UseFormHandleSubmit } from 'react-hook-form';
import { FONT_FAMILIES } from '@const/fonts';
import {
  useLoginUserMutation,
  useRegisterUserMutation,
  useResetPasswordMutation,
} from '@R/services/authentication/authentication';
import { saveEmail, savePassword, setIsDisabledWhenLogining } from '@R/slices/logining/logining';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { showCrossPlatformToast } from '@U/custom-toast';
import { SignInPageStates } from '@U/validate-email-password';
import { REGISTER_BTN, LOGIN_BTN, LoginBtnIcons, RESET_BTN } from './const';
import type { EmailPasswordData } from '@R/services/authentication/types';

export default function LoginRegisterBtn({ handleSubmit }: { handleSubmit: UseFormHandleSubmit<EmailPasswordData> }) {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { pageState, isDisabledWhenLogining } = useAppSelector(({ logining }) => logining);
  const { replace } = useRouter();
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const [loginUser, { isLoading: isLoginingUser }] = useLoginUserMutation();
  const [resetPassword] = useResetPasswordMutation();

  return (
    <Button
      icon={LoginBtnIcons[pageState]}
      mode="contained"
      contentStyle={{ minHeight: 48 }}
      labelStyle={{ fontFamily: FONT_FAMILIES.semiBold }}
      style={{ borderRadius: 8, marginTop: 8 }}
      accessibilityRole="button"
      loading={isLoginingUser || isLoading}
      disabled={isDisabledWhenLogining}
      onPress={handleSubmit(async ({ email, password }: EmailPasswordData) => {
        dispatch(setIsDisabledWhenLogining(true));
        dispatch(saveEmail(email));
        dispatch(savePassword(password));
        if (pageState === SignInPageStates.register) {
          return await registerUser({ email, password })
            .unwrap()
            .then(({ message }) => showCrossPlatformToast(message))
            .catch((error) => errorToast('Во время регистрации произошла ошибка: ', error))
            .finally(() => dispatch(setIsDisabledWhenLogining(false)));
        }
        if (pageState === SignInPageStates.login) {
          return await loginUser({ email, password })
            .unwrap()
            .then(() => replace('/'))
            .catch((error) => errorToast('Во время авторизации произошла ошибка: ', error))
            .finally(() => dispatch(setIsDisabledWhenLogining(false)));
        }
        if (pageState === SignInPageStates.reset) {
          return await resetPassword({ email })
            .unwrap()
            .then(({ message }) => showCrossPlatformToast(message))
            .catch((error) => errorToast('Во время сброса пароля произошла ошибка: ', error))
            .finally(() => dispatch(setIsDisabledWhenLogining(false)));
        }
      })}>
      {pageState === SignInPageStates.register && REGISTER_BTN[language].register}
      {pageState === SignInPageStates.login && LOGIN_BTN[language].login}
      {pageState === SignInPageStates.reset && RESET_BTN[language].login}
    </Button>
  );
}
