import { useContext, memo } from 'react';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { Platform } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { SHARE_BUTTON_TEXT } from './const';
import type { ShareBtnProps } from '../types';

function waitForShareImageRender() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export default memo(function ShareBtn({ cardRef, prepareShareImage, cleanupShareImage }: ShareBtnProps) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { isLoading, isDisabled, setIsDisabled } = useContext(ActivityCardBtnsContext);
  return (
    <IconButton
      onPress={async () => {
        setIsDisabled(true);
        try {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await prepareShareImage?.();
            await waitForShareImageRender();
            const snapshot = await captureRef(
              cardRef as unknown as Parameters<typeof captureRef>[0],
              Platform.OS === 'web' ? { result: 'base64' } : {},
            );
            cleanupShareImage?.();
            await Sharing.shareAsync(snapshot);
          } else {
            if (Platform.OS === 'web') {
              errorToast(SHARE_BUTTON_TEXT[language].webUnavailable);
            } else {
              errorToast(SHARE_BUTTON_TEXT[language].deviceUnavailable);
            }
          }
        } catch (error) {
          errorToast('', error);
        } finally {
          cleanupShareImage?.();
          setIsDisabled(false);
        }
      }}
      testID="iconShareBtn"
      icon="share-outline"
      iconColor={colors.primary}
      size={25}
      disabled={isLoading || isDisabled}
    />
  );
});
