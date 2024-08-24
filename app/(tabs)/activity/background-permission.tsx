import { useBackgroundPermissions } from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BackgroundPermission() {
  const { push } = useRouter();
  const [backgroundPermissionStatus, requestBackgroundPermission] = useBackgroundPermissions();

  useEffect(() => {
    if (backgroundPermissionStatus?.granted) {
      push('/activity');
    }
  }, [backgroundPermissionStatus, push]);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 }}>
      <Text variant="bodyLarge">
        Из-за особенностей операционной системы Android, как только вы выходите из приложения, оно перестает работать.
        Вообще. Это обычно не критично для большинства приложений, но это критично для трекера активности. Для того,
        чтобы вы могли свернуть приложение в фон и оно продолжало получать данные локации для записи маршрута и метрик,
        Вам необходимо дать разрешение на отслеживание локации в фоне.
      </Text>
      <Button mode="outlined" style={{ marginTop: 15 }} onPress={async () => await requestBackgroundPermission()}>
        Запросить доступ
      </Button>
    </SafeAreaView>
  );
}
