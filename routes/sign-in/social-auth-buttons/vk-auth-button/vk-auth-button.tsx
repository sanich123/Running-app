import { useEffect, useRef, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { AppState, Linking, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import { useLoginWithVkNativeMutation } from '@R/services/authentication/authentication';
import { setAuthSession } from '@R/slices/auth/auth';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { loginWithVkNative } from '../../../../modules/runich-auth/src/RunichAuth';
import { SOCIAL_AUTH_TEXT, VK_AUTH_URL } from '../../const';

export default function VkAuthButton() {
  const { replace } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const dispatch = useAppDispatch();
  const copy = SOCIAL_AUTH_TEXT[language];
  const [loginWithVk] = useLoginWithVkNativeMutation();
  const [isLoading, setLoading] = useState(false);
  const authFlowTypeRef = useRef<'external' | 'native' | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let didLeaveAppForExternalAuth = false;
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState !== 'active' && authFlowTypeRef.current === 'external') {
        didLeaveAppForExternalAuth = true;
      } else if (nextAppState === 'active' && didLeaveAppForExternalAuth) {
        didLeaveAppForExternalAuth = false;
        if (authFlowTypeRef.current === 'external') {
          authFlowTypeRef.current = null;
          setLoading(false);
        }
      }
    });
    return () => subscription.remove();
  }, []);

  const handleNativeLogin = async () => {
    authFlowTypeRef.current = 'native';
    setLoading(true);
    try {
      const authorization = await loginWithVkNative();
      if (!authorization) throw new Error('VK sign-in did not return authorization data.');
      const session = await loginWithVk(authorization).unwrap();
      dispatch(setAuthSession(session));
      replace('/(tabs)/(home)');
    } catch (error) {
      errorToast('Не удалось войти через VK', error);
    } finally {
      authFlowTypeRef.current = null;
      setLoading(false);
    }
  };

  const handleExternalLogin = async () => {
    authFlowTypeRef.current = 'external';
    setLoading(true);
    try {
      await Linking.openURL(VK_AUTH_URL);
    } catch (error) {
      authFlowTypeRef.current = null;
      setLoading(false);
      errorToast('Не удалось открыть VK', error);
    }
  };

  return (
    <Button
      testID="vk-auth"
      accessibilityLabel={copy.vk}
      accessibilityRole="button"
      mode="contained"
      buttonColor="#0061C9"
      textColor="#FFFFFF"
      compact
      uppercase={false}
      style={styles.button}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
      icon={
        isLoading
          ? undefined
          : () => (
              <Svg width={20} height={20} viewBox="5.8 9.5 16.2 10.5">
                <Path
                  d="M6.8 10.15c.118 5.723 3.13 9.16 8.093 9.16h.288v-3.26c1.808.183 3.156 1.53 3.707 3.26h2.606c-.707-2.606-2.54-4.05-3.68-4.6 1.139-.681 2.75-2.32 3.13-4.56h-2.371c-.498 1.82-1.978 3.473-3.392 3.63v-3.63h-2.409v6.35c-1.466-.367-3.379-2.147-3.457-6.35H6.8Z"
                  fill="#FFFFFF"
                />
              </Svg>
            )
      }
      loading={isLoading}
      disabled={isLoading}
      onPress={() => (Platform.OS === 'android' ? void handleNativeLogin() : void handleExternalLogin())}>
      {isLoading ? '' : copy.vk}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: { flex: 1, borderRadius: 8 },
  buttonContent: { minHeight: 48 },
  buttonLabel: { fontWeight: '600' },
});
