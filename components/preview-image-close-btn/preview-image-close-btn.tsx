import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { PreviewImagesProps } from '../preview-images/preview-images';

export default function PreviewImageCloseBtn({
  setImages,
  images,
  isDisabled,
  image,
}: PreviewImagesProps & { image: string }) {
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => setImages(images.filter((photo) => photo !== image))}
      disabled={isDisabled || isDisabledWhileSending}
      testID="deleteIcon"
      style={[{ zIndex: 5 }, (isDisabled || isDisabledWhileSending) && { opacity: 0.5 }]}>
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
