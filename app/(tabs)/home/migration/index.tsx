import { Button, Text } from 'react-native-paper';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { getMigrationArchiveAndSendToServer } from '@U/migration-archive';

export default function Migration() {
  return (
    <View style={{ flex: 1, padding: 10, alignItems: 'center' }}>
      <Text variant="bodyLarge">Вы можете перенести все свои активности из Strava в наш сервис. </Text>
      <View style={{ flex: 1, justifyContent: 'flex-start' }}>
        <Link href="https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export#h_01GG58HC4F1BGQ9PQZZVANN6WF">
          <Text variant="bodyLarge" style={{ color: 'orange' }}>
            1. Более подробная информация по ссылке
          </Text>
        </Link>
        <Text variant="bodyLarge">2. На почту придет письмо со ссылкой на архив в формате .zip</Text>
        <Text variant="bodyLarge">3. Архив надо загрузить по кнопке ниже</Text>
        <Text variant="bodyLarge">
          Из архива будут вырезаны Ваши фото и видео, так как они могут весить очень много мегабайт
        </Text>
        <Text variant="bodyLarge">
          Процедура разархивирования и архивирования может занимать ощутимое время. Например, при весе изначального
          архива в 60 мегабайт, это занимает 10-15 секунд.
        </Text>
        <Text variant="bodyLarge">
          Так как передача архива на сервер происходит по протоколу http, необходимо делать это при наличии хорошего и
          быстрого вайфай соединения
        </Text>
        <Button mode="outlined" onPress={getMigrationArchiveAndSendToServer}>
          Выбрать и послать архив
        </Button>
      </View>
    </View>
  );
}
