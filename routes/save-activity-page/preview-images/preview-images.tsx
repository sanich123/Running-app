import { FlatList, View, StyleSheet } from 'react-native';
import PreviewImage from '@Routes/save-activity-page/preview-image/preview-image';
import PreviewImageCloseBtn from '../preview-image-close-btn/preview-image-close-btn';
import type { PreviewImagesProps } from './types';

export default function PreviewImages({
  setImages,
  images,
  isDisabled,
  compact = false,
  horizontal = false,
}: PreviewImagesProps) {
  const renderPreview = ({ url, thumbnail }: { url: string; thumbnail: string | null }, index: number) => (
    <View style={[styles.imageContainer, { zIndex: images.length - index }]} key={`${url}/${index}`}>
      <PreviewImage image={thumbnail || url} mediaUrl={url} isDisabled={isDisabled} index={index} compact={compact} />
      <PreviewImageCloseBtn
        setImages={setImages}
        images={images}
        image={url}
        thumbnail={thumbnail}
        isDisabled={isDisabled}
        compact={compact}
      />
    </View>
  );

  if (horizontal) {
    return (
      <FlatList
        testID="horizontal-preview-list"
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalImagesWrapper}
        keyExtractor={({ url }, index) => `${url}/${index}`}
        renderItem={({ item, index }) => renderPreview(item, index)}
      />
    );
  }

  return (
    <View style={styles.imagesWrapper}>
      {images.length > 0 && images.map((image, index) => renderPreview(image, index))}
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
  horizontalImagesWrapper: { columnGap: 5 },
  imageContainer: {
    overflow: 'visible',
    position: 'relative',
  },
});
