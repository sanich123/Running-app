import { useContext, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Button, MD3Colors, ProgressBar } from 'react-native-paper';

import { SaveActivityContext } from '../../utils/context/save-activity';
import { errorHandler } from '../../utils/error-handler';
import { getAccessToGallery, getBlobFromUri, getInfoFromUri, uploadToFirebaseStorage } from '../../utils/file-sending';

export default function ChoosePhotoBtn() {
  const { setPhotoUrl, isDisabled, setIsDisabled } = useContext(SaveActivityContext);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgressPercent] = useState(0);

  return (
    <>
      <Button
        mode="outlined"
        icon="camera"
        onPress={async () => {
          setIsDisabled(true);
          setIsLoading(true);
          try {
            const result = await getAccessToGallery();
            if (!result.canceled) {
              const uri = result.assets[0].uri;
              setImage(uri);
              const blob = await getBlobFromUri(result.assets[0].uri);
              const fileName = getInfoFromUri(uri);
              await uploadToFirebaseStorage(fileName, blob as Blob, setProgressPercent, setIsLoading, setPhotoUrl);
              setIsDisabled(false);
            }
          } catch (error) {
            errorHandler(error);
            setIsDisabled(false);
            setIsLoading(false);
          } finally {
            setIsDisabled(false);
            setIsLoading(false);
          }
        }}
        style={{ marginTop: 15 }}
        loading={isLoading}
        disabled={isDisabled}>
        {`Upload${isLoading ? 'ing' : ''} an image`}
      </Button>
      {image && <ProgressBar progress={progress} color={MD3Colors.error50} style={{ marginTop: 15 }} />}
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
