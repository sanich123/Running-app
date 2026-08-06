import { View, StyleSheet } from 'react-native';
import { useAppSelector } from '@R/typed-hooks';
import PreviewImage from '@Routes/save-activity-page/preview-image/preview-image';
import PreviewImageCloseBtn from '../preview-image-close-btn/preview-image-close-btn';
import PreviewUploadableImage from '../preview-uploadable-image/preview-uploadable-image';
import type { PreviewImagesProps } from './types';

export default function PreviewImages({ setImages, images, isDisabled }: PreviewImagesProps) {
  const { isCameraVisible } = useAppSelector(({ manualActivity }) => manualActivity);

  return (
    <View style={styles.imagesWrapper}>
      {images.length > 0 &&
        images.map(({ url, thumbnail }, index) => (
          <View style={{ position: 'relative', zIndex: 0 }} key={`${url}/${index}`}>
            <PreviewImageCloseBtn setImages={setImages} images={images} image={url} isDisabled={isDisabled} />
            {isCameraVisible ? (
              <PreviewUploadableImage image={thumbnail || url} index={index} isDisabled={isDisabled} />
            ) : (
              <PreviewImage image={thumbnail || url} isDisabled={isDisabled} index={index} />
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
