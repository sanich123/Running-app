import { supabase } from '@A/supabase/supabase-init';
import { saveGoogleProfileInfo } from '@R/profile/profile';
import { useAppDispatch } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function GoogleSignBtn({ setIsDisabled }: { setIsDisabled: (arg: boolean) => void }) {
  const dispatch = useAppDispatch();
  const { dark } = useTheme();

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
        setIsDisabled(true);
        try {
          await GoogleSignin.hasPlayServices();
          const { data: userInfo } = await GoogleSignin.signIn();
          dispatch(saveGoogleProfileInfo(userInfo?.user));
          if (userInfo?.idToken) {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: userInfo.idToken,
            });
            if (error) {
              showCrossPlatformToast(`error: ${error?.message}`);
            }
          } else {
            showCrossPlatformToast('no ID token present!');
            throw new Error('no ID token present!');
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
          setIsDisabled(false);
        }
      }}
    />
  );
}
