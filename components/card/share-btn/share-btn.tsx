import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { errorHandler } from '@U/error-handler';
import { usePathname } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { MutableRefObject, ReactNode, useContext, memo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import { captureRef } from 'react-native-view-shot';

type ShareBtnProps = {
  cardRef: MutableRefObject<ReactNode>;
  fullViewRef: MutableRefObject<ReactNode>;
};

export default memo(function ShareBtn({ cardRef, fullViewRef }: ShareBtnProps) {
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
      iconColor={MD3Colors.primary50}
      size={25}
      disabled={isLoading || isDisabled}
      style={Platform.OS === 'web' && styles.isInCenter}
    />
  );
});

const styles = StyleSheet.create({
  isInCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});