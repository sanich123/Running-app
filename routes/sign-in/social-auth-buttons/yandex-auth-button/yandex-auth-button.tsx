import { useEffect, useRef, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { AppState, Linking, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, TouchableRipple } from 'react-native-paper';
import { useLoginWithYandexNativeMutation } from '@R/services/authentication/authentication';
import { setAuthSession } from '@R/slices/auth/auth';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { loginWithYandexNative } from '../../../../modules/runich-auth/src/RunichAuth';
import { SOCIAL_AUTH_TEXT, YANDEX_AUTH_URL } from '../../const';

export default function YandexAuthButton() {
  const { replace } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const dispatch = useAppDispatch();
  const copy = SOCIAL_AUTH_TEXT[language];
  const [loginWithYandex] = useLoginWithYandexNativeMutation();
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
      const accessToken = await loginWithYandexNative();
      if (!accessToken) return;
      const session = await loginWithYandex({ accessToken }).unwrap();
      dispatch(setAuthSession(session));
      replace('/(tabs)/(home)');
    } catch (error) {
      errorToast('Не удалось войти через Яндекс', error);
    } finally {
      authFlowTypeRef.current = null;
      setLoading(false);
    }
  };

  const handleExternalLogin = async () => {
    authFlowTypeRef.current = 'external';
    setLoading(true);
    try {
      await Linking.openURL(YANDEX_AUTH_URL);
    } catch (error) {
      authFlowTypeRef.current = null;
      setLoading(false);
      errorToast('Не удалось открыть Яндекс', error);
    }
  };

  return (
    <View style={styles.root}>
      <TouchableRipple
        testID="yandex-auth"
        accessibilityLabel={copy.yandex}
        style={styles.button}
        onPress={() => (Platform.OS === 'android' ? void handleNativeLogin() : void handleExternalLogin())}
        disabled={isLoading}
        accessibilityRole="button">
        <View style={styles.buttonContent}>
          <View style={styles.iconFrame}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Svg width={17} height={17} viewBox="3.5 3.5 17 17">
                <Path
                  d="M16.6 4.5h-5.1c-3.1 0-5.05 1.6-5.05 4.25 0 2.15 1.16 3.5 3.15 3.95L5.5 19.5h3.7l4.15-6.45h2.1v6.45h3.1v-15H16.6Zm-1.15 6.1h-3.2c-1.65 0-2.45-.6-2.45-1.8 0-1.25.85-1.9 2.45-1.9h3.2v3.7Z"
                  fill="#FFFFFF"
                />
              </Svg>
            )}
          </View>
          <Text style={styles.buttonLabel}>{isLoading ? copy.signingIn : copy.yandex}</Text>
        </View>
      </TouchableRipple>
      {isLoading ? (
        <View accessibilityRole="progressbar" style={styles.progressStatus} testID="yandex-auth-progress">
          <ActivityIndicator size="small" />
          <Text>
            {copy.signingInWith} {copy.yandex}…
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  button: {
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D12B16',
  },
  buttonContent: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center', width: '100%' },
  buttonLabel: { color: '#FFFFFF', fontWeight: '600' },
  iconFrame: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  progressStatus: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 8 },
});
