import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { View, Text } from '../../../components/Themed';
import useGetLocation from '../../../utils/hooks/use-get-location';

export default function Feed() {
  const { id } = useSelector(({ userInfo }) => userInfo);
  useGetLocation();

  return (
    <View style={styles.container}>
      <Text>Здесь будут новости от друзей</Text>
      <Link href="/(tabs)/home/show-map">
        <Text>Страница с просмотром карты тренировки</Text>
      </Link>
      <Link href="/(tabs)/home/[id]">
        <Text>Страница с возможность редактирования комментария по id</Text>
      </Link>
      <Link href="/home/modal">
        <Text>Открывается модалка</Text>
      </Link>
    </View>
  );
}
