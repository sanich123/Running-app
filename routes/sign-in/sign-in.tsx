import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Surface } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { useLazyVerifyConfigQuery } from '@R/services/authentication/authentication';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import CustomPasswordInput from '@S/custom-password-input/custom-password-input';
import CustomTextInput from '@S/custom-text-input/custom-text-input';
import { emailValidation, passwordValidation } from '@S/custom-text-input/types';
import { errorToast } from '@S/error-toast/error-toast';
import { showCrossPlatformToast } from '@U/custom-toast';
import { SignInPageStates } from '@U/validate-email-password';
import ConfirmEmailCode from './confirm-email-code/confirm-email-code';
import { SIGN_IN_FIELDS } from './const';
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
          .catch((error) => errorToast('', error));
      }
    }
  }, [replace, url, verifyToken]);

  return (
    <CrossPlatformLayout edges={['bottom']} scrollViewEnabled>
      <Intro />
      <Surface mode="flat" style={styles.inputsWrapper}>
        <CustomTextInput<EmailPasswordData>
          control={control}
          fieldName="email"
          label={SIGN_IN_FIELDS.email}
          validation={emailValidation}
          inputMode="email"
          autoComplete="email"
        />
        {pageState !== SignInPageStates.reset && (
          <CustomPasswordInput<EmailPasswordData>
            control={control}
            fieldName="password"
            label={SIGN_IN_FIELDS.password}
            validation={passwordValidation}
            returnKeyType="send"
            returnKeyLabel="send"
          />
        )}
        {isNeedToShowConfirmEmailInput && <ConfirmEmailCode watch={watch} />}
        <LoginRegisterBtn handleSubmit={handleSubmit} />
        <LoginRegisterNavigation />
      </Surface>
    </CrossPlatformLayout>
  );
}

const styles = StyleSheet.create({
  inputsWrapper: {
    alignSelf: 'center',
    borderRadius: 8,
    gap: 4,
    marginBottom: 32,
    padding: 12,
    width: '94%',
    maxWidth: 351,
    marginHorizontal: 'auto',
  },
});
