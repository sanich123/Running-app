import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import LocationConsent from '../location-consent/location-consent';
import type { ForegroundLocationSwitcherProps } from '../types';

export default function ForegroundLocationSwitcher({ requestForegroundPermission }: ForegroundLocationSwitcherProps) {
  const [locationConsentAccepted, setLocationConsentAccepted] = useState(false);
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  return (
    <View style={[styles.switcherWrapper, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}>
      <View style={styles.headerRow}>
        <View style={styles.textWrapper}>
          <Text variant="titleSmall" style={styles.title}>
            {language === LANGUAGES.russian ? 'Геолокация во время использования' : 'Location while using the app'}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {language === LANGUAGES.russian ? 'Нужно для записи маршрута' : 'Required to record your route'}
          </Text>
        </View>
        <Button
          testID="foreground-location-allow"
          mode="outlined"
          compact
          icon="map-marker-outline"
          disabled={!locationConsentAccepted}
          onPress={async () => {
            try {
              await requestForegroundPermission();
            } catch (error) {
              errorToast('Не удалось запросить доступ к геолокации', error);
            }
          }}>
          {' '}
          {language === LANGUAGES.russian ? 'Разрешить' : 'Allow'}{' '}
        </Button>
      </View>
      <LocationConsent accepted={locationConsentAccepted} onChange={setLocationConsentAccepted} />
    </View>
  );
}

const styles = StyleSheet.create({
  switcherWrapper: {
    display: 'flex',
    alignItems: 'stretch',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'column',
    gap: 12,
    marginTop: 12,
    padding: 12,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  textWrapper: { flex: 1, gap: 4 },
  title: { fontWeight: '700' },
});
