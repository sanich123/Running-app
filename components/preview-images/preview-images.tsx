import PreviewImage from '@C/preview-image/preview-image';
import PreviewImageCloseBtn from '@C/preview-image-close-btn/preview-image-close-btn';
import PreviewUploadableImage from '@C/preview-uploadable-image/preview-uploadable-image';
import { useAppSelector } from '@R/typed-hooks';
import { View, StyleSheet } from 'react-native';

export type PreviewImagesProps = {
  images: string[];
  isDisabled: boolean;
  setImages: (arg: string[]) => void;
};

export default function PreviewImages({ setImages, images, isDisabled }: PreviewImagesProps) {
  const { isCameraVisible } = useAppSelector(({ activity }) => activity);

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
