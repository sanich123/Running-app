import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function ChoosePhotoBtn() {
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
    <>
      <Button mode="outlined" icon="camera" onPress={pickImage} style={{ marginTop: 15 }}>
        Save an image
      </Button>
      {image && <Image source={{ uri: image }} style={styles.imageStyle} />}
    </>
  );
}

const styles = StyleSheet.create({
  imageStyle: {
    width: 200,
    height: 200,
    marginTop: 15,
  },
});
