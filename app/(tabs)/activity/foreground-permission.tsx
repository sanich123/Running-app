import { useForegroundPermissions } from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForegroundPermission() {
  const { push } = useRouter();
  const [foregroundPermissionStatus, requestForegroundPermission] = useForegroundPermissions();
  useEffect(() => {
    if (foregroundPermissionStatus?.granted) {
      push('/activity');
    }
  }, [foregroundPermissionStatus, push]);
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 }}>
      <Text variant="bodyLarge">Для работы приложения нужно дать права на отслеживание местоположения телефона</Text>
      <Button mode="outlined" style={{ marginTop: 15 }} onPress={async () => await requestForegroundPermission()}>
        Запросить доступ
      </Button>
    </SafeAreaView>
  );
}
