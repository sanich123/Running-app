import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, useTheme } from 'react-native-paper';
import { ROUTES, STATUSES } from '@const/enums';
import {
  resetLastKm,
  resetLocationsFromBackground,
  setDurationAt,
  setActivityStatus,
  setEmptyLastArrayWhenPaused,
  stopDurationTimer,
} from '@R/slices/location/location';
import { clearTrackingRecovery } from '@R/slices/tracking-recovery/tracking-recovery';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { errorToast } from '@S/error-toast/error-toast';
import { getCurrentActivityDuration } from '@U/activity-duration';
import { stopLocationTracking } from '@U/location/expo-task-manager/background-location';
import { getActiveLocationJournalId, removeLocationJournal } from '@U/location/location-journal';
import { resetPedometerActivity } from '@U/pedometer/pedometer';
import { ACTIVITY_CLOSE_BTN } from './const';

export default function CloseBtn() {
  const { back, canGoBack, replace } = useRouter();
  const { colors } = useTheme();
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const { duration, durationTimerBase, durationTimerStartedAt } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ settings }) => settings);
  const dispatch = useAppDispatch();
  const [isStoppingTracking, setIsStoppingTracking] = useState(false);

  function closeActivity() {
    const journalId = getActiveLocationJournalId();
    if (journalId) removeLocationJournal(journalId);
    dispatch(clearTrackingRecovery());
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
      resetPedometerActivity();
      const durationAtClose = getCurrentActivityDuration({ duration, durationTimerBase, durationTimerStartedAt });
      dispatch(setDurationAt(durationAtClose));
      dispatch(stopDurationTimer());
      dispatch(setActivityStatus(STATUSES.paused));
      dispatch(setEmptyLastArrayWhenPaused());
      if (durationAtClose > 0) {
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
