import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Card, List, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';

export default function WatchImportPage() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;

  return (
    <>
      <Stack.Screen options={{ title: isRussian ? 'Подключение часов' : 'Connect a watch' }} />
      <CrossPlatformLayout scrollViewEnabled outerStyles={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          {isRussian ? 'Подключение часов' : 'Connect a watch'}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          {isRussian
            ? 'Выберите модель часов, чтобы открыть инструкцию по передаче тренировок в Runich.'
            : 'Choose your watch to see how to send its workouts to Runich.'}
        </Text>

        <Card style={styles.card}>
          <List.Item
            testID="suunto-watch-guide"
            title="Suunto"
            description={isRussian ? 'Подключение и импорт тренировок' : 'Connect and import workouts'}
            titleNumberOfLines={1}
            left={(props) => <List.Icon {...props} icon="watch-variant" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => push('/watch-import/suunto' as Parameters<typeof push>[0])}
            style={styles.providerRow}
          />
        </Card>

        <View style={styles.note}>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {isRussian
              ? 'Сейчас в Runich настроен импорт через системное хранилище здоровья телефона. Прямого Bluetooth-подключения часов к Runich нет.'
              : 'Runich imports workouts through your phone’s health store. It does not connect to the watch over Bluetooth.'}
          </Text>
        </View>
      </CrossPlatformLayout>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 10 },
  title: { marginBottom: 2 },
  card: { marginTop: 4 },
  providerRow: { paddingVertical: 6 },
  note: { marginTop: 2 },
});
