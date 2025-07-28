import { useLoginUserWithGoogleMutation } from '@R/services/authentication/authentication';
import { setIsDisabledWhenLogining } from '@R/slices/logining/logining';
import { useAppDispatch } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function GoogleSignBtn() {
  const dispatch = useAppDispatch();
  const { dark } = useTheme();
  const [loginWithGoogle] = useLoginUserWithGoogleMutation();
  const { replace } = useRouter();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT,
        iosClientId:
          process.env.APP_VARIANT === 'development'
            ? process.env.EXPO_PUBLIC_GOOGLE_IOS_DEV
            : process.env.EXPO_PUBLIC_GOOGLE_IOS_PREVIEW,
      });
    }
  }, [dark]);

  return (
    <GoogleSigninButton
      style={{ width: '100%' }}
      color={GoogleSigninButton.Color.Dark}
      size={GoogleSigninButton.Size.Wide}
      onPress={async () => {
        try {
          dispatch(setIsDisabledWhenLogining(true));
          await GoogleSignin.hasPlayServices();
          const { data: userInfo } = await GoogleSignin.signIn();
          if (userInfo?.user) {
            const {
              user: { name, email, photo },
            } = userInfo;
            await loginWithGoogle({ name, email, photo })
              .unwrap()
              .then(() => replace('/'))
              .catch((error) => showCrossPlatformToast(error));
          }
        } catch (error: any) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            showCrossPlatformToast('user has cacelled auth flow');
          } else if (error.code === statusCodes.IN_PROGRESS) {
            showCrossPlatformToast('process is executing');
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            showCrossPlatformToast('play services is not available');
          } else {
            showCrossPlatformToast('unexpected error occured');
          }
        } finally {
          dispatch(setIsDisabledWhenLogining(false));
        }
      }}
    />
  );
}
