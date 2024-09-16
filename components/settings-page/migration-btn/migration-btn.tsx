import { Href, useRouter } from 'expo-router';
import { Button } from 'react-native-paper';

export default function MigrationBtn() {
  const { push } = useRouter();
  return (
    <Button mode="outlined" onPress={() => push('/home/migration' as Href)}>
      Перенести активности из Strava
    </Button>
  );
}
