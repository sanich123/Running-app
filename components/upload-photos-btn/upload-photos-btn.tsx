import { useContext, useState } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, MD3Colors, ProgressBar } from 'react-native-paper';

import { SaveActivityContext } from '../../utils/context/save-activity';
import { errorHandler } from '../../utils/error-handler';
import { getAccessToGallery, getBlobFromUri, getInfoFromUri, uploadToFirebaseStorage } from '../../utils/file-sending';

export default function UploadPhotosBtn() {
  const { isDisabled, setIsDisabled, images, isLoading, setIsLoading, setPhotoUrls, photoUrls, setImages } =
    useContext(SaveActivityContext);
  const [progress, setProgressPercent] = useState(0);
  const { width } = useWindowDimensions();
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
              const fileName = getInfoFromUri(uri);
              const blob = await getBlobFromUri(uri);
              await uploadToFirebaseStorage(
                fileName,
                blob as Blob,
                setProgressPercent,
                setIsLoading,
                setPhotoUrls,
                photoUrls,
              );
              setImages([...images, uri]);
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
      {images && <ProgressBar progress={progress} color={MD3Colors.error50} style={{ marginTop: 15 }} />}
      <View style={styles.imagesWrapper}>
        {images &&
          images.map((image) => (
            <Image key={image} source={{ uri: image }} style={styles.imageStyle} width={width / 3 - 10} height={100} />
          ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  imagesWrapper: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', columnGap: 5 },
  imageStyle: {
    marginTop: 15,
  },
});
