import PreviewImage from '@C/save-activity-page/preview-image/preview-image';
import { useAppSelector } from '@R/typed-hooks';
import { View, StyleSheet } from 'react-native';

import PreviewImageCloseBtn from '../preview-image-close-btn/preview-image-close-btn';
import PreviewUploadableImage from '../preview-uploadable-image/preview-uploadable-image';

export type PreviewImagesProps = {
  images: { url: string; thumbnail: string | null }[];
  isDisabled: boolean;
  setImages: (arg: { url: string; thumbnail: string | null }[]) => void;
};

export default function PreviewImages({ setImages, images, isDisabled }: PreviewImagesProps) {
  const { isCameraVisible } = useAppSelector(({ activity }) => activity);

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
