import { Button, Text } from 'react-native-paper';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { getMigrationArchiveAndSendToServer } from '@U/migration-strava/migration-archive';
import { useState } from 'react';
import { useAuth } from '@A/context/auth-context';

export default function Migration() {
  const { user } = useAuth();
  const [isDisabled, setIsDisabled] = useState(false);
  const [isUnzipping, setIsUnzipping] = useState(false);
  const [isRemovingMedia, setIsRemovingMedia] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isSendingArchive, setIsSendingArchive] = useState(false);
  const [isDeletingCacheFolder, setIsDeletingCacheFolder] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState('');
  const isInitial =
    !isDisabled &&
    !isUnzipping &&
    !isRemovingMedia &&
    !isZipping &&
    !isSendingArchive &&
    !isDeletingCacheFolder &&
    !isSuccess &&
    !isError;

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
          Из архива будут вырезаны Ваши фото и видео, так как они могут весить очень много
        </Text>
        <Text variant="bodyLarge">
          Процедура разархивирования и архивирования может занимать ощутимое время. При размере архива в 60 мегабайт,
          это занимает 10-15 секунд.
        </Text>
        <Text variant="bodyLarge">
          Так как данных довольно много, необходим высокоскоростной доступ в интернет, лучше всего wi-fi
        </Text>
        <Text variant="bodyLarge">
          {isUnzipping && 'Распаковываем архив'}
          {isRemovingMedia && 'Удаляем медиа, потому что их может быть очень много'}
          {isZipping && 'Запаковываем архив обратно'}
          {isSendingArchive && 'Отправляем архив на сервер'}
          {isDeletingCacheFolder && 'Подчищаем файлы'}
          {isSuccess && 'Архив на сервере, теперь в зависимости от объема данных они будут обрабатываться до 20 минут'}
          {isError && 'Произошла ошибка'}
        </Text>
        <Button
          mode="outlined"
          onPress={async () =>
            getMigrationArchiveAndSendToServer({
              setIsDisabled,
              setIsUnzipping,
              setIsRemovingMedia,
              setIsZipping,
              setIsSendingArchive,
              setIsDeletingCacheFolder,
              setIsSuccess,
              setIsError,
              userId: `${user?.id}`,
            })
          }
          disabled={isDisabled}>
          {isInitial && 'Выбрать и послать архив'}
          {isUnzipping && 'Распаковываем...'}
          {isRemovingMedia && 'Удаляем медиа...'}
          {isZipping && 'Запаковываем...'}
          {isSendingArchive && 'Отправляем...'}
          {isDeletingCacheFolder && 'Подчищаем...'}
          {isSuccess && 'Успешно!'}
          {isError && 'Ошибка'}
        </Button>
      </View>
    </View>
  );
}
