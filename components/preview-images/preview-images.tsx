import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet, Image, useWindowDimensions, Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { getSignedUrl } from '../../auth/supabase/storage/upload-photo';
import { EXPIRED_TIME } from '../../constants/const';
import { compressAndSendPhoto } from '../../utils/file-sending';

type PreviewImagesProps = {
  images: string[];
  isDisabled: boolean;
  setImages: (arg: string[]) => void;
};

export default function PreviewImages({ setImages, images, isDisabled }: PreviewImagesProps) {
  const { isDisabledWhileSending, isCameraVisible } = useSelector(({ activity }) => activity);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  return (
    <View style={styles.imagesWrapper}>
      {images.length > 0 &&
        images.map((image, index) => (
          <View style={{ position: 'relative', zIndex: 0 }} key={`${image}/${index}`}>
            <Pressable
              onPress={() => setImages(images.filter((uri) => uri !== image))}
              disabled={isDisabled || isDisabledWhileSending}
              testID="deleteIcon"
              style={[{ zIndex: 5 }, (isDisabled || isDisabledWhileSending) && { opacity: 0.5 }]}>
              <MaterialCommunityIcons
                name="close-circle"
                color={colors.onPrimaryContainer}
                size={25}
                style={{ position: 'absolute', right: 2, top: 16, zIndex: 10 }}
              />
            </Pressable>
            {isCameraVisible ? (
              <Pressable
                onPress={async () => {
                  const pathToPhoto = await compressAndSendPhoto(image, user.id);
                  console.log(pathToPhoto);
                  const url = await getSignedUrl(pathToPhoto, EXPIRED_TIME);
                  console.log(url);
                }}>
                <Image
                  testID={`imagePreview-${index}`}
                  source={{ uri: image }}
                  style={[styles.imageStyle, (isDisabled || isDisabledWhileSending) && { opacity: 0.5 }]}
                  width={width / 3 - 10}
                  height={100}
                />
                <Text
                  variant="bodyLarge"
                  style={{ position: 'absolute', top: 50, left: 10, color: colors.onPrimaryContainer }}>
                  Add to activity
                </Text>
              </Pressable>
            ) : (
              <Image
                testID={`imagePreview-${index}`}
                source={{ uri: image }}
                style={[styles.imageStyle, (isDisabled || isDisabledWhileSending) && { opacity: 0.5 }]}
                width={width / 3 - 10}
                height={100}
              />
            )}
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  imagesWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 5,
  },
  imageStyle: {
    marginTop: 15,
  },
});
