import { FlatList, View, StyleSheet, useWindowDimensions } from 'react-native';
import PreviewImage from '@Routes/save-activity-page/preview-image/preview-image';
import MediaModerationPlaceholder from '@S/media-moderation-placeholder/media-moderation-placeholder';
import PreviewImageCloseBtn from '../preview-image-close-btn/preview-image-close-btn';
import type { PreviewImagesProps } from './types';
import type { ActivityPhoto } from '@R/slices/activity/types';

export default function PreviewImages({
  setImages,
  images,
  isDisabled,
  compact = false,
  horizontal = false,
  activityId,
  isPersistedActivityMedia = false,
}: PreviewImagesProps) {
  const { width } = useWindowDimensions();
  const previewWidth = compact ? width / 4 - 14 : width / 3 - 10;
  const previewHeight = compact ? 68 : 100;
  const renderPreview = (media: ActivityPhoto, index: number) => (
    <View
      style={[
        styles.imageContainer,
        !media.url && { height: previewHeight, width: previewWidth },
        { zIndex: images.length - index },
      ]}
      key={`${media.id ?? media.assetId ?? media.url}/${index}`}>
      {media.url ? (
        <>
          <PreviewImage
            image={media.thumbnail || media.url}
            mediaUrl={media.url}
            isDisabled={isDisabled}
            index={index}
            compact={compact}
          />
          {media.mediaReviewStatus &&
          media.mediaReviewStatus !== 'approved' &&
          media.mediaReviewStatus !== 'rejected' ? (
            <MediaModerationPlaceholder
              status={media.mediaReviewStatus}
              compact
              overlay
              hideTitle={compact && horizontal}
            />
          ) : null}
        </>
      ) : (
        <MediaModerationPlaceholder
          status={media.mediaReviewStatus}
          blurhash={media.blurhash}
          compact={compact}
          testID={`pending-media-preview-${index}`}
        />
      )}
      <PreviewImageCloseBtn
        setImages={setImages}
        images={images}
        media={media}
        isDisabled={isDisabled}
        compact={compact}
        activityId={activityId}
        isPersistedActivityMedia={isPersistedActivityMedia}
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
        keyExtractor={(media, index) => `${media.id ?? media.assetId ?? media.url}/${index}`}
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
