import { useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, IconButton, useTheme } from 'react-native-paper';
import { ROUTES, STATUSES } from '@const/enums';
import {
  resetLastKm,
  resetLocationsFromBackground,
  setDurationAt,
  setActivityStatus,
  setEmptyLastArrayWhenPaused,
  setNavigationTrackId,
  stopDurationTimer,
} from '@R/slices/location/location';
import { clearTrackingRecovery } from '@R/slices/tracking-recovery/tracking-recovery';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { errorToast } from '@S/error-toast/error-toast';
import { MAP_CONTROL_BUTTON_BACKGROUND } from '@S/map-control-button/const';
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
    dispatch(setNavigationTrackId(null));
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
      {Platform.OS === 'ios' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ACTIVITY_CLOSE_BTN[language].btnText}
          accessibilityState={{ disabled: isStoppingTracking }}
          disabled={isStoppingTracking}
          onPress={stopTrackingAndClose}
          style={[
            styles.iconButton,
            {
              backgroundColor: MAP_CONTROL_BUTTON_BACKGROUND,
              borderColor: colors.outlineVariant,
              borderWidth: StyleSheet.hairlineWidth,
            },
          ]}
          testID="activity-close-button">
          {isStoppingTracking ? (
            <ActivityIndicator size={18} color={colors.primary} />
          ) : (
            <SymbolView name="xmark" size={20} tintColor={colors.primary} weight="semibold" />
          )}
        </Pressable>
      ) : (
        <IconButton
          accessibilityLabel={ACTIVITY_CLOSE_BTN[language].btnText}
          containerColor={MAP_CONTROL_BUTTON_BACKGROUND}
          disabled={isStoppingTracking}
          icon="close"
          iconColor={colors.primary}
          loading={isStoppingTracking}
          mode="contained-tonal"
          onPress={stopTrackingAndClose}
          size={22}
          style={styles.iconButton}
          testID="activity-close-button"
        />
      )}
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
  iconButton: {
    alignItems: 'center',
    borderRadius: 20,
    justifyContent: 'center',
    margin: 0,
    minHeight: 40,
    minWidth: 40,
  },
});
