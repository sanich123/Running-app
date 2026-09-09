import { useCallback, useEffect, useRef } from 'react';
import { parse, useLinkingURL } from 'expo-linking';
import { useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { useLazyVerifyConfigQuery } from '@R/services/authentication/authentication';
import { setAuthSession } from '@R/slices/auth/auth';
import { flushAuthPersistence } from '@R/slices/auth/persistence';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function LoginFromUrlRoute() {
  const dispatch = useAppDispatch();
  const hasExistingSession = useAppSelector(({ auth }) => Boolean(auth.accessToken || auth.refreshToken));
  const url = useLinkingURL();
  const { dismissAll, replace, canDismiss } = useRouter();
  const [verifyToken] = useLazyVerifyConfigQuery();
  const handledUrl = useRef<string | null>(null);

  const leaveRoute = useCallback(
    (keepExistingSession: boolean) => {
      if (canDismiss()) {
        dismissAll();
      }
      replace(keepExistingSession ? ROUTES.root : `/${ROUTES.signIn}`);
    },
    [canDismiss, dismissAll, replace],
  );

  useEffect(() => {
    if (!url || handledUrl.current === url) return;
    handledUrl.current = url;

    const { queryParams } = parse(url);
    const code = queryParams?.code?.toString();
    const oauthError = queryParams?.oauthError?.toString();
    if (oauthError) {
      leaveRoute(hasExistingSession);
      errorToast('', oauthError);
    } else if (code) {
      verifyToken({ code })
        .unwrap()
        .then(async (session) => {
          dispatch(setAuthSession(session));
          await flushAuthPersistence();
          leaveRoute(true);
        })
        .catch((error) => {
          leaveRoute(hasExistingSession);
          errorToast('', error);
        });
    }
  }, [dispatch, hasExistingSession, leaveRoute, url, verifyToken]);

  return <FullPageActivityLoader />;
}
