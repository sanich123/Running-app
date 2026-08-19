import { View, StyleSheet } from 'react-native';
import PreviewImage from '@Routes/save-activity-page/preview-image/preview-image';
import PreviewImageCloseBtn from '../preview-image-close-btn/preview-image-close-btn';
import type { PreviewImagesProps } from './types';

export default function PreviewImages({ setImages, images, isDisabled, compact = false }: PreviewImagesProps) {
  return (
    <View style={styles.imagesWrapper}>
      {images.length > 0 &&
        images.map(({ url, thumbnail }, index) => (
          <View style={[styles.imageContainer, { zIndex: images.length - index }]} key={`${url}/${index}`}>
            <PreviewImage image={thumbnail || url} isDisabled={isDisabled} index={index} compact={compact} />
            <PreviewImageCloseBtn
              setImages={setImages}
              images={images}
              image={url}
              thumbnail={thumbnail}
              isDisabled={isDisabled}
              compact={compact}
            />
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
  imageContainer: {
    overflow: 'visible',
    position: 'relative',
  },
});
