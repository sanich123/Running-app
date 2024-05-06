import { supabase } from '@A/supabase/supabase-init';
import { useEffect } from 'react';
import { useToast } from 'react-native-toast-notifications';

export default function GoogleSignInWeb({ setIsDisabled }: { setIsDisabled: (arg: boolean) => void }) {
  const toast = useToast();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    //@ts-ignore
    window.handleSignInWithGoogle = async function (response: any) {
      setIsDisabled(true);
      try {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
          nonce: 'NONCE',
        });
        if (data) {
          toast.show('Successfully! Redirect to the app');
        } else if (error) {
          toast.show(JSON.stringify(error));
        }
      } catch (error) {
        toast.show(JSON.stringify(error));
      } finally {
        setIsDisabled(false);
      }
    };
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <div
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
      />
    </>
  );
}
