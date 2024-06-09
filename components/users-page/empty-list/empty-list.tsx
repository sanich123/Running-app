import { useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function EmptyUsersList({ isInitial }: { isInitial: boolean }) {
  const { language } = useAppSelector(({ language }) => language);
  const message =
    language === LANGUAGES.english
      ? 'There are no users with this name or email'
      : 'Пользователи с такими данными не найдены';

  return (
    <>
      {!isInitial && (
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 10,
          }}>
          <Text variant="titleMedium">{message}</Text>
        </View>
      )}
    </>
  );
}
