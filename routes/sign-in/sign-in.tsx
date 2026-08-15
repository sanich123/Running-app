import { useEffect } from 'react';
import Constants from 'expo-constants';
import { useLinkingURL, parse } from 'expo-linking';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
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
import { REGISTERED_USERS_ONLY_LABEL, SIGN_IN_FIELDS, VK_AUTH_URL, YANDEX_AUTH_URL } from './const';
import Intro from './intro/intro';
import LoginRegisterBtn from './login-register-btn/login-register-btn';
import LoginRegisterNavigation from './login-register-navigation/login-register-navigation';
import type { EmailPasswordData } from '@R/services/authentication/types';

export default function SignIn() {
  const dispatch = useAppDispatch();
  const { email, password } = useAppSelector(({ logining }) => logining);
  const { authStep } = useLocalSearchParams<{ authStep?: string }>();

  const { colors } = useTheme();
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
  }, [dismissAll, dispatch, replace, url, verifyToken]);

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
        {currentAuthStep !== SignInPageStates.reset && currentAuthStep !== SignInPageStates.emailLink && (
          <CustomPasswordInput<EmailPasswordData>
            control={control}
            fieldName="password"
            label={SIGN_IN_FIELDS.password}
            validation={passwordValidation}
            returnKeyType="send"
            returnKeyLabel="send"
          />
        )}
        <LoginRegisterBtn handleSubmit={handleSubmit} authStep={currentAuthStep} />
        {currentAuthStep === SignInPageStates.login && (
          <>
            <Button
              mode="outlined"
              testID="yandex-auth"
              contentStyle={styles.yandexContent}
              labelStyle={styles.yandexButtonLabel}
              style={styles.yandexButton}
              onPress={() => void Linking.openURL(YANDEX_AUTH_URL)}>
              <View style={styles.yandexLabel}>
                <View style={styles.yandexIcon}>
                  <Text style={styles.yandexIconText}>Я</Text>
                </View>
                <Text style={styles.yandexText}>Войти через Яндекс</Text>
              </View>
            </Button>
            <Button
              mode="outlined"
              testID="vk-auth"
              contentStyle={styles.yandexContent}
              labelStyle={styles.yandexButtonLabel}
              style={styles.vkButton}
              onPress={() => void Linking.openURL(VK_AUTH_URL)}>
              <View style={styles.yandexLabel}>
                <View style={styles.vkIcon}>
                  <Text style={styles.vkIconText}>vk</Text>
                </View>
                <Text style={styles.yandexText}>Войти через VK</Text>
              </View>
            </Button>
          </>
        )}
        <LoginRegisterNavigation authStep={currentAuthStep} onAuthStepChange={setAuthStep} />
      </Surface>
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.version}>
          Версия приложения {Constants.expoConfig?.version ?? '—'}
        </Text>
        <View style={styles.links}>
          <Pressable onPress={() => push(`/${ROUTES.privacyPolicy}`)} accessibilityRole="link">
            <Text variant="bodySmall" style={[styles.link, { color: colors.primary }]}>
              Политика конфиденциальности
            </Text>
          </Pressable>
          <Pressable onPress={() => push(`/${ROUTES.legalInformation}`)} accessibilityRole="link">
            <Text variant="bodySmall" style={[styles.link, { color: colors.primary }]}>
              Юридическая информация
            </Text>
          </Pressable>
        </View>
      </View>
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
  footer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  version: {
    opacity: 0.65,
  },
  links: {
    alignItems: 'center',
    gap: 4,
  },
  yandexButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9D9D9',
    borderRadius: 8,
    marginTop: 8,
  },
  vkButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9D9D9',
    borderRadius: 8,
    marginTop: 8,
  },
  yandexContent: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  yandexButtonLabel: {
    marginHorizontal: 0,
  },
  yandexLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  yandexIcon: {
    alignItems: 'center',
    backgroundColor: '#FC3F1D',
    borderRadius: 6,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  yandexIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  vkIcon: {
    alignItems: 'center',
    backgroundColor: '#0077FF',
    borderRadius: 6,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  vkIconText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textAlign: 'center',
  },
  yandexText: {
    color: '#1F1F1F',
    fontWeight: '600',
  },
  link: {
    color: '#3A9561',
    fontSize: 13,
    textAlign: 'center',
  },
});
