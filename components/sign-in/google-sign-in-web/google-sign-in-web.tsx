import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppDispatch } from '@R/typed-hooks';

export default function GoogleSignInWeb() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (Platform.OS === 'web') {
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'google-signin-client_id');
      metaTag.setAttribute('content', '617323850499-oaorec6kohhna9p0dqlek590imnab6jq.apps.googleusercontent.com');
      document.getElementsByTagName('head')[0].appendChild(metaTag);
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/platform.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      //@ts-ignore
      window.onSignIn = function onSignIn(googleUser) {
        const profile = googleUser?.getBasicProfile();
        console.log('ID: ' + profile.getId());
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail());
      };
      // window.handleSignInWithGoogle = async function (response: any) {
      //   dispatch(setIsDisabledWhenLogining(true));
      //   try {
      //     console.log(response);

      //     // const { data, error } = await supabase.auth.signInWithIdToken({
      //     //   provider: 'google',
      //     //   token: response.credential,
      //     //   nonce: 'NONCE',
      //     // });
      //     // if (data) {
      //     //   showCrossPlatformToast('Successfully! Redirect to the app');
      //     // } else if (error) {
      //     //   showCrossPlatformToast(JSON.stringify(error));
      //     // }
      //   } catch (error) {
      //     showCrossPlatformToast(JSON.stringify(error));
      //   } finally {
      //     dispatch(setIsDisabledWhenLogining(false));
      //   }
      // };
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [dispatch]);

  return (
    <>
      {/* <meta
        name="google-signin-client_id"
        content="617323850499-oaorec6kohhna9p0dqlek590imnab6jq.apps.googleusercontent.com"
      /> */}
      <div className="g-signin2" data-onsuccess="onSignIn"></div>
      {/* <div
        id="g_id_onload"
        data-client_id="617323850499-oaorec6kohhna9p0dqlek590imnab6jq.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleSignInWithGoogle"
        data-nonce=""
        data-auto_prompt="false"
      />
      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="filled_blue"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
        data-width="372"
      /> */}
    </>
  );
}
