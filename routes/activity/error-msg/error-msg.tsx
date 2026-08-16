import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon, IconButton, Text, useTheme } from 'react-native-paper';
import {
  setIsAppShuted,
  setIsTooMuchSpeed,
  setTooMuchSpeed,
  setTooMuchSpeedTimestamp,
} from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { TIMEOUT_MESSAGE } from '@Routes/activity/location-indicator/const';
import { getMaxTrackingSpeedForSport } from '@U/location/location-utils';
import { ACTIVITY_ERROR_MSG } from './const';

export default function ErrorMsg() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { isAppShutedByPhone, isTooMuchSpeed, tooMuchSpeed, tooMuchSpeedTimestamp } = useAppSelector(
    ({ location }) => location,
  );
  const { sport } = useAppSelector(({ additionalInfoActivity }) => additionalInfoActivity);
  const { language } = useAppSelector(({ language }) => language);
  const tooMuchSpeedTime = tooMuchSpeedTimestamp
    ? new Date(tooMuchSpeedTimestamp).toLocaleTimeString(language === 'russian' ? 'ru-RU' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : '--:--:--';

  const dismissTooMuchSpeed = () => {
    dispatch(setIsTooMuchSpeed(false));
    dispatch(setTooMuchSpeed(0));
    dispatch(setTooMuchSpeedTimestamp(null));
  };

  useEffect(() => {
    if (isAppShutedByPhone) {
      setTimeout(() => dispatch(setIsAppShuted(false)), TIMEOUT_MESSAGE);
    }
  }, [isAppShutedByPhone, dispatch]);

  return (
    <View style={styles.errorMsg}>
      {isAppShutedByPhone && (
        <View
          style={[styles.message, { backgroundColor: colors.primaryContainer, borderColor: colors.outlineVariant }]}>
          <Icon source="backup-restore" size={22} color={colors.primary} />
          <View style={styles.messageContent}>
            <Text variant="titleSmall" style={{ color: colors.onPrimaryContainer }}>
              {ACTIVITY_ERROR_MSG[language].recoveryTitle}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {ACTIVITY_ERROR_MSG[language].errorMsg}
            </Text>
          </View>
        </View>
      )}
      {isTooMuchSpeed && (
        <View
          style={[styles.message, { backgroundColor: colors.tertiaryContainer, borderColor: colors.outlineVariant }]}>
          <Icon source="map-marker-alert-outline" size={22} color={colors.tertiary} />
          <View style={styles.messageContent}>
            <Text variant="titleSmall" style={{ color: colors.onTertiaryContainer }}>
              {ACTIVITY_ERROR_MSG[language].speedTitle}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {ACTIVITY_ERROR_MSG[language].tooMuchSpeed(
                tooMuchSpeed,
                getMaxTrackingSpeedForSport(sport),
                tooMuchSpeedTime,
              )}
            </Text>
          </View>
          <IconButton
            testID="dismiss-too-much-speed"
            icon="close"
            size={18}
            onPress={dismissTooMuchSpeed}
            accessibilityLabel="Закрыть предупреждение о GPS"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorMsg: {
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 2,
  },
  message: {
    alignItems: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  messageContent: { flex: 1, gap: 3 },
});
