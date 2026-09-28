import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';

export default function SubscriptionRequired({ feature }: { feature: 'media' | 'routeReplay' }) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = {
    media: {
      [LANGUAGES.english]: 'Photos and videos are available with Runich Plus',
      [LANGUAGES.russian]: 'Фото и видео доступны по подписке Runich Plus',
    },
    routeReplay: {
      [LANGUAGES.english]: 'Workout route replay is available with Runich Plus',
      [LANGUAGES.russian]: 'Повтор маршрута доступен по подписке Runich Plus',
    },
  }[feature][language];

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant }]}>
      <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, flex: 1 }}>
        {copy}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
