import { StyleSheet } from 'react-native';

import { View, Text } from '../../components/Themed';
import useGetLocation from '../../utils/hooks/use-get-location';

export default function Feed() {
  useGetLocation();

  return (
    <View style={styles.container}>
      <Text>Здесь будут новости от друзей</Text>
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
