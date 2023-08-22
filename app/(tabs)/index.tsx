import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { StyleSheet, Image } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';

import EditScreenInfo from '../../components/EditScreenInfo';
import { View, Text } from '../../components/Themed';
import useGetLocation from '../../utils/hooks/use-get-location';

export default function Feed() {
  useGetLocation();
  const [image, setImage] = useState(null);
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feed</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
      <IconButton icon="camera" iconColor={MD3Colors.error50} size={20} onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
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
