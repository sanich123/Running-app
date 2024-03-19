import { supabase } from '@A/supabase/supabase-init';
import { saveGoogleProfileInfo } from '@R/profile/profile';
import { useAppDispatch } from '@R/typed-hooks';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function GoogleSignBtn() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: '617323850499-oaorec6kohhna9p0dqlek590imnab6jq.apps.googleusercontent.com',
        iosClientId:
          process.env.EXPO_PUBLIC_APP_VARIANT === 'development'
            ? '617323850499-ib9jp3gj3fbev205jbhcfe0ou9oairm2.apps.googleusercontent.com'
            : '617323850499-i286kru7q6bgi2dfl38c6keljvhaelad.apps.googleusercontent.com',
      });
    }
  }, []);

  return (
    <GoogleSigninButton
      color={GoogleSigninButton.Color.Dark}
      size={GoogleSigninButton.Size.Wide}
      onPress={async () => {
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
            } else {
              showCrossPlatformToast('Перенаправляем в приложение', ToastDuration.long);
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
        }
      }}
    />
  );
}
