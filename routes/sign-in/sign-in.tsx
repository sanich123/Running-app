import { useEffect } from 'react';
import Constants from 'expo-constants';
import { useLinkingURL, parse } from 'expo-linking';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Surface, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { ROUTES } from '@const/enums';
import { useLazyVerifyConfigQuery } from '@R/services/authentication/authentication';
import { resetAuthSlice, setAccessToken, setRefreshToken, setUserId } from '@R/slices/auth/auth';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import CustomPasswordInput from '@S/custom-password-input/custom-password-input';
import CustomTextInput from '@S/custom-text-input/custom-text-input';
import { emailValidation, passwordValidation } from '@S/custom-text-input/types';
import { errorToast } from '@S/error-toast/error-toast';
import { SignInPageStates } from '@U/validate-email-password';
import { SIGN_IN_FIELDS } from './const';
import AuthDivider from './auth-divider/auth-divider';
import LegalLinks from './legal-links/legal-links';
import LoginRegisterBtn from './login-register-btn/login-register-btn';
import LoginRegisterNavigation from './login-register-navigation/login-register-navigation';
import SocialAuthButtons from './social-auth-buttons/social-auth-buttons';
import type { EmailPasswordData } from '@R/services/authentication/types';

export default function SignIn() {
  const dispatch = useAppDispatch();
  const { email, password } = useAppSelector(({ logining }) => logining);
  const { authStep, oauthError: localOauthError } = useLocalSearchParams<{ authStep?: string; oauthError?: string }>();

  const { control, handleSubmit } = useForm<EmailPasswordData>({
    defaultValues: { email, password },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const { push, replace, dismissAll } = useRouter();
  const isValidAuthStep =
    authStep === SignInPageStates.login ||
    authStep === SignInPageStates.register ||
    authStep === SignInPageStates.reset ||
    authStep === SignInPageStates.emailLink;
  const currentAuthStep = isValidAuthStep ? (authStep as SignInPageStates) : SignInPageStates.login;
  const setAuthStep = (nextAuthStep: SignInPageStates) =>
    push({ pathname: `/${ROUTES.signIn}`, params: { authStep: nextAuthStep } });
  const url = useLinkingURL();
  const [verifyToken] = useLazyVerifyConfigQuery();

  useEffect(() => {
    if (url) {
      const { queryParams } = parse(url);
      if (queryParams?.accessToken) {
        verifyToken({ accessToken: queryParams.accessToken.toString() })
          .unwrap()
          .then(({ accessToken, refreshToken, userId }) => {
            dispatch(setAccessToken(accessToken));
            dispatch(setRefreshToken(refreshToken));
            dispatch(setUserId(userId));
            replace(ROUTES.root);
          })
          .catch((error) => {
            dispatch(resetAuthSlice());
            dismissAll();
            errorToast('', error);
          });
      }
    }
  }, [dismissAll, dispatch, localOauthError, replace, url, verifyToken]);

  return (
    <CrossPlatformLayout
      edges={['top', 'bottom']}
      scrollViewEnabled
      outerStyles={styles.pageContent}>
      <Surface mode="flat" style={styles.inputsWrapper}>
        {currentAuthStep === SignInPageStates.login && (
          <>
            <SocialAuthButtons />
            <AuthDivider />
          </>
        )}
          <CustomTextInput<EmailPasswordData>
          control={control}
          fieldName="email"
          label={SIGN_IN_FIELDS.email}
          validation={emailValidation}
          inputMode="email"
          autoComplete="email"
          compact
        />
        {currentAuthStep !== SignInPageStates.reset && currentAuthStep !== SignInPageStates.emailLink && (
          <CustomPasswordInput<EmailPasswordData>
            control={control}
            fieldName="password"
            label={SIGN_IN_FIELDS.password}
            validation={passwordValidation}
            returnKeyType="send"
            returnKeyLabel="send"
            compact
          />
        )}
        <LoginRegisterBtn handleSubmit={handleSubmit} authStep={currentAuthStep} />
        <LoginRegisterNavigation
          authStep={currentAuthStep}
          onAuthStepChange={setAuthStep}
          showEmailLinkNavigation={false}
        />
        {currentAuthStep === SignInPageStates.login && <LegalLinks />}
      </Surface>
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.version}>
          Версия приложения {Constants.expoConfig?.version ?? '—'}
        </Text>
      </View>
    </CrossPlatformLayout>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    justifyContent: 'center',
    paddingVertical: 16,
  },
  inputsWrapper: {
    alignSelf: 'center',
    borderRadius: 8,
    gap: 4,
    marginBottom: 4,
    padding: 12,
    width: '94%',
    maxWidth: 351,
  },
  oauthError: {
    alignSelf: 'center',
    borderColor: '#D32F2F',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginBottom: 12,
    padding: 12,
    width: '94%',
    maxWidth: 351,
  },
  footer: {
    alignItems: 'center',
    gap: 0,
    marginBottom: 0,
    paddingHorizontal: 20,
  },
  version: {
    opacity: 0.65,
  },
});
