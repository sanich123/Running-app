import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { getSignedUrl } from '../../auth/supabase/storage/upload-photo';
import { EXPIRED_TIME } from '../../constants/const';
import { savePhotoUrls } from '../../redux/activity/activity';
import { SaveActivityContext } from '../../utils/context/save-activity';
import { errorHandler } from '../../utils/error-handler';
import { compressAndSendPhoto, getAccessToGallery } from '../../utils/file-sending';

export default function UploadPhotosBtn() {
  const { isDisabled, setIsDisabled, images, isLoading, setIsLoading, setImages } = useContext(SaveActivityContext);
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);
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
              const pathToPhoto = await compressAndSendPhoto(imgSrc, user.id);
              const url = await getSignedUrl(pathToPhoto, EXPIRED_TIME);
              setImages([...images, url]);
              dispatch(savePhotoUrls([...images, url]));
            }
          } catch (error) {
            errorHandler(error);
          } finally {
            setIsDisabled(false);
            setIsLoading(false);
          }
        }}
        style={{ marginTop: 15 }}
        loading={isLoading}
        disabled={isDisabled || isDisabledWhileSending}>
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
                disabled={isDisabled || isDisabledWhileSending}
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
