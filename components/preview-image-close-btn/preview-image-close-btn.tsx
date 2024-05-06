import { PreviewImagesProps } from '@C/preview-images/preview-images';
import { deletePhotoUrl } from '@R/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function PreviewImageCloseBtn({
  setImages,
  images,
  isDisabled,
  image,
}: PreviewImagesProps & { image: string }) {
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        setImages(images.filter(({ url }) => url !== image));
        dispatch(deletePhotoUrl(image));
      }}
      disabled={isDisabled || isDisabledWhileSending}
      testID="deleteIcon"
      style={({ pressed }) => [{ opacity: pressed || isDisabled || isDisabledWhileSending ? 0.5 : 1 }, { zIndex: 5 }]}>
      <MaterialCommunityIcons name="close-circle" color={colors.onPrimaryContainer} size={25} style={styles.closeBtn} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    right: 2,
    top: 16,
    zIndex: 10,
  },
});
