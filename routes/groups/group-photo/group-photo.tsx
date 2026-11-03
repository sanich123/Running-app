import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import CustomImage from '@S/custom-image/custom-image';
import MediaModerationPlaceholder from '@S/media-moderation-placeholder/media-moderation-placeholder';
import type { GroupPhotoProps } from './types';

export default function GroupPhoto({
  photoUrl,
  photoPreviewUrl,
  photoBlurhash,
  photoReviewStatus,
  photoPending = false,
  fallbackIcon = 'account-group-outline',
  iconSize = 25,
  style,
  testID = 'group-photo',
}: GroupPhotoProps) {
  const isPrivatePreview = Boolean(photoPreviewUrl && !photoUrl);
  const isReviewPending = ['queued', 'processing', 'review_required'].includes(photoReviewStatus ?? '');
  const isAwaitingPublication = photoReviewStatus === 'approved' && !photoUrl;
  const isUnderModeration =
    (photoPending && photoReviewStatus !== 'approved') || isReviewPending || isAwaitingPublication;
  const imageUrl = isPrivatePreview ? photoPreviewUrl : isUnderModeration ? null : photoUrl;
  const moderationStatus = photoReviewStatus ?? 'review_required';

  return (
    <View style={[styles.frame, style]} testID={testID}>
      {imageUrl ? (
        <CustomImage
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          placeholder={photoBlurhash}
          placeholderContentFit="cover"
          recyclingKey={imageUrl}
          cachePolicy="memory-disk"
          testID={`${testID}-image`}
        />
      ) : isUnderModeration ? (
        <MediaModerationPlaceholder
          status={moderationStatus}
          blurhash={photoBlurhash}
          compact
          showStatus={false}
          testID={`${testID}-placeholder`}
        />
      ) : (
        <View style={styles.fallback}>
          <Icon source={fallbackIcon} size={iconSize} />
        </View>
      )}
      {isUnderModeration && !isPrivatePreview ? (
        <MediaModerationPlaceholder status={moderationStatus} compact overlay testID={`${testID}-moderation-status`} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', position: 'relative' },
  fallback: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
