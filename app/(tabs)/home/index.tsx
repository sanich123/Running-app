import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { View, Text } from '../../../components/Themed';
import useGetLocation from '../../../utils/hooks/use-get-location';

export default function Feed() {
  const { location, error, readyToShowLocation } = useGetLocation();
  // console.log(location, error, readyToShowLocation);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
