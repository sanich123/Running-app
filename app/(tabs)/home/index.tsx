import { Link } from 'expo-router';
import { FlatList, ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';

import { View, Text } from '../../../components/Themed';
import { useGetUsersQuery } from '../../../redux/runnich-api/runnich-api';
import useGetLocation from '../../../utils/hooks/use-get-location';

export default function Feed() {
  const { readyToShowLocation } = useGetLocation();
  const { data, error, isLoading } = useGetUsersQuery('');

  console.log(data);
  return (
    <>
      {data && (
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View>
              <Text>{item.login}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
      <ScrollView>
        <View style={styles.container}>
          {isLoading && <ActivityIndicator animating color={MD2Colors.red800} />}

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

          {error && (
            <View>
              <Text>An error occured during fetching the data</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
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
});
