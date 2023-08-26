import { getDownloadURL, ref } from 'firebase/storage';
import { useContext, useState } from 'react';
import { Image, StyleSheet, ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';

import { FIREBASE_STORAGE } from '../../firebaseConfig';
import { SaveActivityContext } from '../../utils/context/save-activity';
import { errorHandler } from '../../utils/error-handler';
import { getAccessToGallery, getBlobFromUri, getInfoFromUri, uploadToFirebaseStorage } from '../../utils/file-sending';

export default function ChoosePhotoBtn() {
  const { setPhotoUrl } = useContext(SaveActivityContext);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function pickImage() {
    setIsLoading(true);

    const result = await getAccessToGallery();
    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        setImage(uri);
        const blob = await getBlobFromUri(result.assets[0].uri);
        const fileName = getInfoFromUri(uri);
        await uploadToFirebaseStorage(fileName, blob as Blob);
        setIsLoading(false);
        ToastAndroid.show('File has successfully uploaded', ToastAndroid.SHORT);
        const url = await getDownloadURL(ref(FIREBASE_STORAGE, fileName));
        setPhotoUrl(url);
        ToastAndroid.show('Url to file has successfully received', ToastAndroid.SHORT);
      } catch (error) {
        errorHandler(error);
      }
    }
  }
  return (
    <>
      <Button mode="outlined" icon="camera" onPress={pickImage} style={{ marginTop: 15 }} loading={isLoading}>
        Upload an image
      </Button>
      {image && <Image source={{ uri: image }} style={styles.imageStyle} />}
    </>
  );
}

const styles = StyleSheet.create({
  imageStyle: {
    marginTop: 15,
    width: 220,
    height: 220,
  },
});
