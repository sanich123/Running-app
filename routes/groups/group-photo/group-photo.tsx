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
  const imageUrl = photoUrl ?? photoPreviewUrl;
  const isPrivatePreview = Boolean(photoPreviewUrl && !photoUrl);

  return (
    <View style={[styles.frame, style]} testID={testID}>
      {imageUrl ? (
        <CustomImage
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          placeholder={photoBlurhash}
          placeholderContentFit="cover"
        />
      ) : photoPending ? (
        <MediaModerationPlaceholder
          status={photoReviewStatus ?? 'review_required'}
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
      {photoPending && !isPrivatePreview ? (
        <MediaModerationPlaceholder
          status={photoReviewStatus ?? 'review_required'}
          compact
          overlay
          testID={`${testID}-moderation-status`}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', position: 'relative' },
  fallback: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
