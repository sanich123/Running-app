import { useEffect } from 'react';
import { parse, useLinkingURL } from 'expo-linking';
import { useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { useLazyVerifyConfigQuery } from '@R/services/authentication/authentication';
import { resetAuthSlice, setAccessToken, setRefreshToken, setUserId } from '@R/slices/auth/auth';
import { useAppDispatch } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function LoginFromUrlRoute() {
  const dispatch = useAppDispatch();
  const url = useLinkingURL();
  const { dismissAll, replace, canDismiss } = useRouter();
  const [verifyToken] = useLazyVerifyConfigQuery();

  useEffect(() => {
    if (url) {
      const { queryParams } = parse(url);
      const code = queryParams?.code?.toString();
      if (code) {
        verifyToken({ code })
          .unwrap()
          .then(({ accessToken: verifiedAccessToken, refreshToken, userId }) => {
            dispatch(setAccessToken(verifiedAccessToken));
            dispatch(setRefreshToken(refreshToken));
            dispatch(setUserId(userId));
            if (canDismiss()) {
              dismissAll();
            }
            replace(ROUTES.root);
          })
          .catch((error) => {
            dispatch(resetAuthSlice());
            if (canDismiss()) {
              dismissAll();
            }
            replace(`/${ROUTES.signIn}`);
            errorToast('', error);
          });
      }
    }
  }, [dispatch, dismissAll, replace, url, verifyToken, canDismiss]);

  return <FullPageActivityLoader />;
}
