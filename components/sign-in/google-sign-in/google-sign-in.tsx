import { supabase } from '@A/supabase/supabase-init';
import { saveGoogleProfileInfo } from '@R/profile/profile';
import { useAppDispatch } from '@R/typed-hooks';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function GoogleSignBtn({ setIsDisabled }: { setIsDisabled: (arg: boolean) => void }) {
  const dispatch = useAppDispatch();
  const { dark } = useTheme();
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (dark) {
      setCounter((counter) => counter + 1);
    } else {
      setCounter((counter) => counter + 2);
    }
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT,
        iosClientId:
          process.env.EXPO_PUBLIC_APP_VARIANT === 'development'
            ? process.env.EXPO_PUBLIC_GOOGLE_IOS_DEV
            : process.env.EXPO_PUBLIC_GOOGLE_IOS_PREVIEW,
      });
    }
  }, [dark]);

  return (
    <>
      {counter ? (
        <GoogleSigninButton
          style={{ width: '100%' }}
          color={dark ? GoogleSigninButton.Color.Dark : GoogleSigninButton.Color.Light}
          size={GoogleSigninButton.Size.Wide}
          onPress={async () => {
            setIsDisabled(true);
            try {
              await GoogleSignin.hasPlayServices();
              const userInfo = await GoogleSignin.signIn();
              dispatch(saveGoogleProfileInfo(userInfo.user));
              if (userInfo.idToken) {
                const { error } = await supabase.auth.signInWithIdToken({
                  provider: 'google',
                  token: userInfo.idToken,
                });
                if (error) {
                  showCrossPlatformToast(`error: ${error?.message}`, ToastDuration.long);
                }
              } else {
                showCrossPlatformToast('no ID token present!', ToastDuration.long);
                throw new Error('no ID token present!');
              }
            } catch (error: any) {
              if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                showCrossPlatformToast('user has cacelled auth flow', ToastDuration.long);
              } else if (error.code === statusCodes.IN_PROGRESS) {
                showCrossPlatformToast('process is executing', ToastDuration.long);
              } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                showCrossPlatformToast('play services is not available', ToastDuration.long);
              } else {
                showCrossPlatformToast('unexpected error occured', ToastDuration.long);
              }
            } finally {
              setIsDisabled(false);
            }
          }}
        />
      ) : null}
    </>
  );
}
