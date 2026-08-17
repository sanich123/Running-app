import { Image, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { SignInPageStates } from '@U/validate-email-password';

const CONTENT = {
  russian: {
    login: {
      title: 'Тренируйся и общайся',
      description: 'Российский сервис Runich: тренировки, прогресс и социальная сеть без VPN.',
    },
    register: {
      title: 'Создай аккаунт',
      description: 'Заполни данные — мы отправим ссылку и код подтверждения на почту.',
    },
    reset: { title: 'Изменение пароля', description: 'Укажи почту, и мы отправим инструкции для смены пароля.' },
    emailLink: { title: 'Вход по ссылке', description: 'Отправим безопасную ссылку для входа на твою почту.' },
  },
  english: {
    login: {
      title: 'Train and connect',
      description: 'Runich is a Russian fitness and social service that works without a VPN.',
    },
    register: {
      title: 'Create an account',
      description: 'Fill in your details and we will send a confirmation link and code.',
    },
    reset: {
      title: 'Change your password',
      description: 'Enter your email and we will send instructions to change it.',
    },
    emailLink: { title: 'Sign in with a link', description: 'We will send a secure sign-in link to your email.' },
  },
} as const;

export default function AuthStepIntro({ authStep }: { authStep: SignInPageStates }) {
  const { language } = useAppSelector(({ settings: settingsState }) => settingsState);
  const { colors } = useTheme();
  const content = CONTENT[language][authStep === SignInPageStates.emailLink ? 'emailLink' : authStep];
  const isLogin = authStep === SignInPageStates.login;
  const icon =
    authStep === SignInPageStates.login
      ? 'run-fast'
      : authStep === SignInPageStates.register
        ? 'account-plus-outline'
        : 'lock-reset';

  return (
    <View style={[styles.container, isLogin && styles.loginContainer]}>
      <View
        style={[
          styles.iconContainer,
          isLogin && styles.loginIconContainer,
          { backgroundColor: colors.primaryContainer },
        ]}>
        {isLogin ? (
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        ) : (
          <Icon source={icon} size={24} color={colors.primary} />
        )}
      </View>
      <View style={[styles.copy, isLogin && styles.loginCopy]}>
        <Text variant="titleMedium" style={styles.title}>
          {content.title}
        </Text>
        <Text variant="bodySmall" style={[styles.description, { color: colors.onSurfaceVariant }]}>
          {content.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 12, paddingHorizontal: 4 },
  iconContainer: { alignItems: 'center', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 },
  loginContainer: { flexDirection: 'column', gap: 8, paddingHorizontal: 8 },
  loginIconContainer: { borderRadius: 18, height: 64, width: 64 },
  logo: { borderRadius: 14, height: 64, width: 64 },
  copy: { flex: 1, gap: 2 },
  loginCopy: { alignItems: 'center', flex: 0 },
  title: { fontFamily: FONT_FAMILIES.semiBold, textAlign: 'center' },
  description: { lineHeight: 18, textAlign: 'center' },
});
