import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image as ImageCompressor } from 'react-native-compressor';
import { Button, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { getBase64CodedImage, uploadPhoto, getSignedUrl } from '../../auth/supabase/storage/upload-photo';
import { savePhotoUrls } from '../../redux/activity/activity';
import { SaveActivityContext } from '../../utils/context/save-activity';
import { errorHandler } from '../../utils/error-handler';
import { getAccessToGallery } from '../../utils/file-sending';

export default function UploadPhotosBtn() {
  const { isDisabled, setIsDisabled, images, isLoading, setIsLoading, setImages } = useContext(SaveActivityContext);
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const { user } = useAuth();
  const dispatch = useDispatch();

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
              const imgSrc = result.assets[0].uri;
              const compressedImage = await ImageCompressor.compress(imgSrc);
              const base64 = await getBase64CodedImage(compressedImage);
              const pathToPhoto = await uploadPhoto(user.id, base64);
              const url = await getSignedUrl(pathToPhoto, 100000);
              setImages([...images, url]);
              dispatch(savePhotoUrls(images));
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
      <View style={styles.imagesWrapper}>
        {images &&
          images.map((image, index) => (
            <View style={{ position: 'relative' }} key={`${image}${index}`}>
              <MaterialCommunityIcons
                name="close-circle"
                color={theme.colors.onPrimaryContainer}
                size={25}
                style={{ position: 'absolute', right: 2, top: 16, zIndex: 5 }}
                onPress={() => setImages(images.filter((uri) => uri !== image))}
                disabled={isDisabled}
              />
              <Image source={{ uri: image }} style={styles.imageStyle} width={width / 3 - 10} height={100} />
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
