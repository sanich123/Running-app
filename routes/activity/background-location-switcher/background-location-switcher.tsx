import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import type { BackgroundLocationSwitcherProps } from '../types';

export default function BackgroundLocationSwitcher({
  backgroundLocationEnabledModalRef,
}: BackgroundLocationSwitcherProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  return (
    <View style={[styles.switcherWrapper, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}>
      <View style={styles.textWrapper}>
        <Text variant="titleSmall" style={styles.title}>
          {language === LANGUAGES.russian ? 'Фоновая геолокация' : 'Background location'}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {language === LANGUAGES.russian
            ? 'Нужно, чтобы маршрут записывался при заблокированном экране'
            : 'Keeps recording when the screen is locked'}
        </Text>
      </View>
      <Button
        testID="background-location-details"
        mode="outlined"
        compact
        icon="map-marker-radius-outline"
        onPress={async () => {
          try {
            backgroundLocationEnabledModalRef.current?.present();
          } catch (error) {
            errorToast('Не удалось открыть настройки фоновой геолокации', error);
          }
        }}>
        {' '}
        {language === LANGUAGES.russian ? 'Разрешить' : 'Allow'}{' '}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  switcherWrapper: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    padding: 12,
  },
  textWrapper: { flex: 1, gap: 4 },
  title: { fontWeight: '700' },
});
