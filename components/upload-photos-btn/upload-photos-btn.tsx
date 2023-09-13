import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, MD3Colors, ProgressBar, useTheme } from 'react-native-paper';

import { SaveActivityContext } from '../../utils/context/save-activity';
import { errorHandler } from '../../utils/error-handler';
import { getAccessToGallery, getBlobFromUri, getInfoFromUri, uploadToFirebaseStorage } from '../../utils/file-sending';

export default function UploadPhotosBtn() {
  const { isDisabled, setIsDisabled, images, isLoading, setIsLoading, setPhotoUrls, photoUrls, setImages } =
    useContext(SaveActivityContext);
  const [progress, setProgressPercent] = useState(0);
  const { width } = useWindowDimensions();
  const theme = useTheme();
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
      {images?.length ? (
        <ProgressBar progress={progress} color={MD3Colors.primary50} style={{ marginTop: 15 }} />
      ) : null}
      <View style={styles.imagesWrapper}>
        {images &&
          images.map((image) => (
            <View style={{ position: 'relative' }}>
              <MaterialCommunityIcons
                name="close-circle"
                color={theme.colors.onPrimaryContainer}
                size={25}
                style={{ position: 'absolute', right: 2, top: 16, zIndex: 5 }}
                onPress={() => setImages(images.filter((uri) => uri !== image))}
                disabled={isDisabled}
              />
              <Image
                key={image}
                source={{ uri: image }}
                style={styles.imageStyle}
                width={width / 3 - 10}
                height={100}
              />
            </View>
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
