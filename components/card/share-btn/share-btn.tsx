import { useContext, memo } from 'react';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { Platform } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { showCrossPlatformToast } from '@U/custom-toast';
import { errorHandler } from '@U/error-handler';
import type { ShareBtnProps } from '../types';

export default memo(function ShareBtn({ cardRef }: ShareBtnProps) {
  const { colors } = useTheme();
  const { isLoading, isDisabled, setIsDisabled } = useContext(ActivityCardBtnsContext);

  return (
    <IconButton
      onPress={async () => {
        setIsDisabled(true);
        try {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            const snapshot = await captureRef(cardRef, Platform.OS === 'web' ? { result: 'base64' } : {});
            await Sharing.shareAsync(snapshot);
          } else {
            if (Platform.OS === 'web') {
              showCrossPlatformToast('Функция поделиться не работает в этом браузере');
            } else {
              showCrossPlatformToast('Функция поделиться не работает на этом устройстве');
            }
          }
        } catch (error) {
          errorHandler(error);
        } finally {
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
