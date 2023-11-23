import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import PreviewImage from '../preview-image/preview-image';
import PreviewImageCloseBtn from '../preview-image-close-btn/preview-image-close-btn';
import PreviewUploadableImage from '../preview-uploadable-image/preview-uploadable-image';

export type PreviewImagesProps = {
  images: string[];
  isDisabled: boolean;
  setImages: (arg: string[]) => void;
};

export default function PreviewImages({ setImages, images, isDisabled }: PreviewImagesProps) {
  const { isCameraVisible } = useSelector(({ activity }) => activity);

  return (
    <View style={styles.imagesWrapper}>
      {images.length > 0 &&
        images.map((image, index) => (
          <View style={{ position: 'relative', zIndex: 0 }} key={`${image}/${index}`}>
            <PreviewImageCloseBtn setImages={setImages} images={images} image={image} isDisabled={isDisabled} />
            {isCameraVisible ? (
              <PreviewUploadableImage image={image} index={index} isDisabled={isDisabled} />
            ) : (
              <PreviewImage image={image} isDisabled={isDisabled} index={index} />
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
