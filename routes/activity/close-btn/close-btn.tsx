import { useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Icon, useTheme } from 'react-native-paper';
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
import {
  ACTIVITY_HEADER_BUTTON_SIZE,
  ACTIVITY_TRACKING_ERROR_COPY,
  IOS_ACTIVITY_HEADER_ICON_COLOR,
  getActivityHeaderButtonStyle,
  isActivityHeaderButtonTap,
} from '@Routes/activity/const';
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
      errorToast(ACTIVITY_TRACKING_ERROR_COPY.stop, error);
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
          android_ripple={{ color: colors.onSurface, radius: ACTIVITY_HEADER_BUTTON_SIZE / 2 }}
          disabled={isStoppingTracking}
          onPress={stopTrackingAndClose}
          style={styles.iosHeaderButton}
          testID="activity-close-button">
          {isStoppingTracking ? (
            <ActivityIndicator size={18} color={IOS_ACTIVITY_HEADER_ICON_COLOR} />
          ) : (
            <SymbolView name="xmark" size={24} tintColor={IOS_ACTIVITY_HEADER_ICON_COLOR} weight="regular" />
          )}
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ACTIVITY_CLOSE_BTN[language].btnText}
          accessibilityState={{ disabled: isStoppingTracking }}
          disabled={isStoppingTracking}
          onPress={(event) => {
            if (isActivityHeaderButtonTap(event)) {
              stopTrackingAndClose();
            }
          }}
          style={getActivityHeaderButtonStyle(colors.surface, colors.outlineVariant)}
          testID="activity-close-button">
          {isStoppingTracking ? (
            <ActivityIndicator size={18} color={colors.onSurface} />
          ) : (
            <Icon source="close" size={22} color={colors.onSurface} />
          )}
        </Pressable>
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
  iosHeaderButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
