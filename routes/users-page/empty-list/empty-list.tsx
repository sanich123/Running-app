import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { EMPTY_USERS_LIST } from './const';

export default function EmptyUsersList({ isInitial }: { isInitial: boolean }) {
  const { language } = useAppSelector(({ language }) => language);
  const message = EMPTY_USERS_LIST[language];

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
