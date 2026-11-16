import { useCallback, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { errorToast } from '@S/error-toast/error-toast';
import { getAutoSyncKey } from './helpers';

interface UseAutoSyncPreferenceOptions {
  isRussian: boolean;
  userId: string | null;
}

export function useAutoSyncPreference({ isRussian, userId }: UseAutoSyncPreferenceOptions) {
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState(false);
  const autoSyncEnabledRef = useRef(false);

  const restoreAutoSyncEnabled = useCallback((enabled: boolean) => {
    autoSyncEnabledRef.current = enabled;
    setAutoSyncEnabledState(enabled);
  }, []);

  const setAutoSyncEnabled = useCallback(
    async (enabled: boolean) => {
      restoreAutoSyncEnabled(enabled);
      const autoSyncKey = getAutoSyncKey(userId);
      if (!autoSyncKey) return;

      try {
        await SecureStore.setItemAsync(autoSyncKey, String(enabled));
      } catch (saveError) {
        errorToast(
          isRussian ? 'Не удалось сохранить настройку автосинхронизации.' : 'Could not save auto-sync setting.',
          saveError,
        );
      }
    },
    [isRussian, restoreAutoSyncEnabled, userId],
  );

  return { autoSyncEnabled, autoSyncEnabledRef, restoreAutoSyncEnabled, setAutoSyncEnabled };
}
