import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import CrossPlatformLayout from '@C/shared/cross-platform-layout/cross-platform-layout';
import CustomPasswordInput from '@C/shared/custom-password-input/custom-password-input';
import CustomTextInput from '@C/shared/custom-text-input/custom-text-input';
import { emailValidation, passwordValidation } from '@C/shared/custom-text-input/types';
import { errorToast } from '@C/shared/error-toast/error-toast';
import GoogleSignBtn from '@C/sign-in/google-sign-in/google-sign-in';
import GoogleSignInWeb from '@C/sign-in/google-sign-in-web/google-sign-in-web';
import { useLazyVerifyConfigQuery } from '@R/services/authentication/authentication';
import { useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { SignInPageStates } from '@U/validate-email-password';
import ConfirmEmailCode from './confirm-email-code/confirm-email-code';
import Intro from './intro/intro';
import LoginRegisterBtn from './login-register-btn/login-register-btn';
import LoginRegisterNavigation from './login-register-navigation/login-register-navigation';
import type { EmailPasswordData } from '@R/services/authentication/types';

export default function SignIn() {
  const { email, password, pageState } = useAppSelector(({ logining }) => logining);
  const { isNeedToShowConfirmEmailInput } = useAppSelector(({ auth }) => auth);
  const { control, handleSubmit, watch } = useForm<EmailPasswordData>({
    defaultValues: { email, password },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const { replace } = useRouter();
  const url = Linking.useURL();
  const [verifyToken] = useLazyVerifyConfigQuery();

  useEffect(() => {
    if (url) {
      const { queryParams } = Linking.parse(url);
      if (queryParams?.accessToken) {
        verifyToken({ accessToken: queryParams.accessToken.toString() })
          .unwrap()
          .then((success) => {
            showCrossPlatformToast(success.toString());
            replace('/');
          })
          .catch((error) => errorToast(error));
      }
    }
  }, [replace, url, verifyToken]);

  return (
    <CrossPlatformLayout edges={['bottom']} scrollViewEnabled>
      <Intro />
      <View style={styles.inputsWrapper}>
        {Platform.OS !== 'web' ? <GoogleSignBtn /> : <GoogleSignInWeb />}
        <CustomTextInput<EmailPasswordData>
          control={control}
          fieldName="email"
          label="Электронная почта"
          validation={emailValidation}
          inputMode="email"
          autoComplete="email"
        />
        {pageState !== SignInPageStates.reset && (
          <CustomPasswordInput<EmailPasswordData>
            control={control}
            fieldName="password"
            label="Пароль"
            validation={passwordValidation}
            returnKeyType="send"
            returnKeyLabel="send"
          />
        )}
        {isNeedToShowConfirmEmailInput && <ConfirmEmailCode watch={watch} />}
        <LoginRegisterBtn handleSubmit={handleSubmit} />
        <LoginRegisterNavigation />
      </View>
    </CrossPlatformLayout>
  );
}

const styles = StyleSheet.create({
  inputsWrapper: {
    paddingTop: 20,
    flex: 1,
    marginLeft: Platform.OS === 'web' ? 'auto' : 10,
    marginRight: Platform.OS === 'web' ? 'auto' : 10,
  },
});
