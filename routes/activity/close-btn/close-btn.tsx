import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, useTheme } from 'react-native-paper';
import { ROUTES, STATUSES } from '@const/enums';
import {
  resetLastKm,
  resetLocationsFromBackground,
  setActivityStatus,
  setEmptyLastArrayWhenPaused,
} from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { errorToast } from '@S/error-toast/error-toast';
import { stopLocationTracking } from '@U/location/expo-task-manager/background-location';
import { ACTIVITY_CLOSE_BTN } from './const';

export default function CloseBtn() {
  const { back, canGoBack, replace } = useRouter();
  const { colors } = useTheme();
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const { duration } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ settings }) => settings);
  const dispatch = useAppDispatch();
  const [isStoppingTracking, setIsStoppingTracking] = useState(false);

  function closeActivity() {
    dispatch(setActivityStatus(STATUSES.initial));
    dispatch(resetLastKm());
    dispatch(resetLocationsFromBackground());
    if (canGoBack()) {
      back();
    } else {
      replace(ROUTES.root);
    }
  }

  async function stopTrackingAndClose() {
    if (isStoppingTracking) {
      return;
    }

    setIsStoppingTracking(true);
    try {
      await stopLocationTracking();
      dispatch(setActivityStatus(STATUSES.paused));
      dispatch(setEmptyLastArrayWhenPaused());
      if (duration > 0) {
        setIsConfirmDialogVisible(true);
      } else {
        closeActivity();
      }
    } catch (error) {
      errorToast('Не удалось остановить отслеживание геопозиции', error);
    } finally {
      setIsStoppingTracking(false);
    }
  }

  return (
    <>
      <Button
        mode="text"
        compact
        style={styles.layout}
        onPress={stopTrackingAndClose}
        loading={isStoppingTracking}
        disabled={isStoppingTracking}
        textColor={colors.onSurfaceVariant}>
        {ACTIVITY_CLOSE_BTN[language].btnText}
      </Button>
      <ConfirmDialog
        visible={isConfirmDialogVisible}
        title={ACTIVITY_CLOSE_BTN[language].alertName}
        message={ACTIVITY_CLOSE_BTN[language].alertQuestion}
        confirmText={ACTIVITY_CLOSE_BTN[language].alertAccept}
        onDismiss={() => setIsConfirmDialogVisible(false)}
        onConfirm={() => {
          setIsConfirmDialogVisible(false);
          closeActivity();
        }}
      />
    </>
  );
}
const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 10,
  },
});
