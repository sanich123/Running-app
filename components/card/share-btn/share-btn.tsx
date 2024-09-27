import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { errorHandler } from '@U/error-handler';
import { usePathname } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useContext, memo } from 'react';
import { IconButton, useTheme } from 'react-native-paper';
import { captureRef } from 'react-native-view-shot';
import { ShareBtnProps } from '../types';

export default memo(function ShareBtn({ cardRef, fullViewRef }: ShareBtnProps) {
  const { colors } = useTheme();
  const { isLoading, isDisabled, setIsDisabled } = useContext(ActivityCardBtnsContext);
  const pathname = usePathname();
  const isFullView = pathname.includes('activity');

  return (
    <IconButton
      onPress={async () => {
        setIsDisabled(true);
        try {
          const snapshot = await captureRef(isFullView ? fullViewRef : cardRef);
          await Sharing.shareAsync(snapshot);
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
