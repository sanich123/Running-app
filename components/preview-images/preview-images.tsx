import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet, Image, useWindowDimensions, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

type PreviewImagesProps = {
  images: string[];
  isDisabled: boolean;
  setImages: (arg: string[]) => void;
};

export default function PreviewImages({ setImages, images, isDisabled }: PreviewImagesProps) {
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  return (
    <View style={styles.imagesWrapper}>
      {images &&
        images.map((image, index) => (
          <View style={{ position: 'relative' }} key={`${image}/${index}`}>
            <Pressable
              onPress={() => setImages(images.filter((uri) => uri !== image))}
              disabled={isDisabled || isDisabledWhileSending}
              testID="deleteIcon"
              style={{ zIndex: 5 }}>
              <MaterialCommunityIcons
                name="close-circle"
                color={colors.onPrimaryContainer}
                size={25}
                style={{ position: 'absolute', right: 2, top: 16 }}
              />
            </Pressable>
            <Image
              testID={`imagePreview-${index}`}
              source={{ uri: image }}
              style={styles.imageStyle}
              width={width / 3 - 10}
              height={100}
            />
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  imagesWrapper: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', columnGap: 5 },
  imageStyle: {
    marginTop: 15,
  },
});
