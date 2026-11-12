import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';
import { RunichHealth } from '../../../../modules/runich-health/src/RunichHealth';

export function useHealthConnectAccess({ accessDenied, accessError }: { accessDenied: string; accessError: string }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isGranted, setIsGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const healthAccessCheckIdRef = useRef(0);

  const refreshHealthAccess = useCallback(async () => {
    const checkId = ++healthAccessCheckIdRef.current;
    try {
      const permissions = await RunichHealth.getPermissions();
      if (checkId === healthAccessCheckIdRef.current) setIsGranted(permissions.granted ?? false);
    } catch {
      // The explicit access action below reports request errors to the user.
    }
  }, []);

  useEffect(() => {
    const initialCheck = setTimeout(() => void refreshHealthAccess(), 0);
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') void refreshHealthAccess();
    });
    return () => {
      clearTimeout(initialCheck);
      subscription.remove();
    };
  }, [refreshHealthAccess]);

  const requestAccess = useCallback(async () => {
    ++healthAccessCheckIdRef.current;
    setIsRequesting(true);
    setError(null);
    try {
      const permissions = await RunichHealth.requestPermissions();
      if (!permissions.granted) {
        setError(accessDenied);
        return;
      }
      setIsGranted(true);
    } catch (requestError) {
      setError(accessError);
      errorToast('', requestError);
    } finally {
      setIsRequesting(false);
    }
  }, [accessDenied, accessError]);

  return { error, isGranted, isRequesting, requestAccess };
}
