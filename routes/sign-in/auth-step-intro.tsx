import { Image, View, StyleSheet } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { SignInPageStates } from '@U/validate-email-password';
import { AUTH_STEP_INTRO_CONTENT } from './const';

export default function AuthStepIntro({ authStep }: { authStep: SignInPageStates }) {
  const { language } = useAppSelector(({ settings: settingsState }) => settingsState);
  const { colors } = useTheme();
  const content = AUTH_STEP_INTRO_CONTENT[language][authStep === SignInPageStates.emailLink ? 'emailLink' : authStep];
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
