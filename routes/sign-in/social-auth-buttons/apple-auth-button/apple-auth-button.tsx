import { useEffect, useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useLoginWithAppleNativeMutation } from '@R/services/authentication/authentication';
import { setAuthSession } from '@R/slices/auth/auth';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { SOCIAL_AUTH_TEXT } from '../../const';

export default function AppleAuthButton() {
  const { replace } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const dispatch = useAppDispatch();
  const copy = SOCIAL_AUTH_TEXT[language];
  const [loginWithApple] = useLoginWithAppleNativeMutation();
  const [isAvailable, setAvailable] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    void AppleAuthentication.isAvailableAsync()
      .then(setAvailable)
      .catch(() => setAvailable(false));
  }, []);

  const handlePress = async () => {
    setLoading(true);
    try {
      const nonce = Array.from(await Crypto.getRandomBytesAsync(32), (byte) => byte.toString(16).padStart(2, '0')).join(
        '',
      );
      const credential = await AppleAuthentication.signInAsync({
        nonce,
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        return errorToast(copy.appleLoginFailed);
      }

      const session = await loginWithApple({
        identityToken: credential.identityToken,
        nonce,
        givenName: credential.fullName?.givenName ?? undefined,
        familyName: credential.fullName?.familyName ?? undefined,
      }).unwrap();
      dispatch(setAuthSession(session));
      replace('/(tabs)/(home)');
    } catch (error) {
      const errorCode = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
      if (errorCode !== 'ERR_REQUEST_CANCELED') errorToast(copy.appleLoginFailed, error);
    } finally {
      setLoading(false);
    }
  };

  return isAvailable ? (
    <View style={styles.root}>
      <AppleAuthentication.AppleAuthenticationButton
        testID="apple-auth"
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={8}
        style={styles.appleButton}
        onPress={handlePress}
        pointerEvents={isLoading ? 'none' : 'auto'}
        accessibilityState={{ disabled: isLoading }}
      />
      {isLoading ? (
        <View accessibilityRole="progressbar" style={styles.progressStatus} testID="apple-auth-progress">
          <ActivityIndicator size="small" />
          <Text>
            {copy.signingInWith} {copy.apple}…
          </Text>
        </View>
      ) : null}
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  root: { width: '100%' },
  appleButton: { height: 48, marginTop: 12, width: '100%' },
  progressStatus: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 12 },
});
