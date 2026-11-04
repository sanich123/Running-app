import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Icon, IconButton } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import CustomImage from '@S/custom-image/custom-image';
import MediaModerationPlaceholder from '@S/media-moderation-placeholder/media-moderation-placeholder';
import { GROUPS_COPY } from '../const';
import { isGroupPhotoUnderModeration } from './utils';
import type { GroupPhotoProps } from './types';

export default function GroupPhoto({
  photoUrl,
  photoPreviewUrl,
  photoBlurhash,
  photoReviewStatus,
  photoPending,
  isOwner = false,
  fallbackIcon = 'account-group-outline',
  iconSize = 25,
  style,
  testID = 'group-photo',
}: GroupPhotoProps) {
  const [isPhotoViewerVisible, setIsPhotoViewerVisible] = useState(false);
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = GROUPS_COPY[language];
  const isPrivatePreview = Boolean(photoPreviewUrl && !photoUrl);
  const isUnderModeration = isGroupPhotoUnderModeration({
    photoUrl,
    photoPreviewUrl,
    photoBlurhash,
    photoReviewStatus,
    photoPending,
  });
  const imageUrl = isUnderModeration
    ? isOwner && isPrivatePreview
      ? photoPreviewUrl
      : null
    : (photoUrl ?? photoPreviewUrl);
  const moderationStatus = photoReviewStatus ?? 'review_required';

  return (
    <>
      <View style={[styles.frame, style]} testID={testID}>
        {imageUrl ? (
          <>
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.openPhoto}
              onPress={(event) => {
                event.stopPropagation();
                setIsPhotoViewerVisible(true);
              }}
              style={StyleSheet.absoluteFill}
              testID={`${testID}-open-button`}
            />
          </>
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
        {isUnderModeration && !isOwner ? (
          <MediaModerationPlaceholder
            status={moderationStatus}
            compact
            overlay
            testID={`${testID}-moderation-status`}
          />
        ) : null}
      </View>
      {isPhotoViewerVisible && imageUrl ? (
        <Modal
          visible={isPhotoViewerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsPhotoViewerVisible(false)}>
          <View style={styles.photoModal}>
            <Pressable
              accessibilityLabel={copy.closePhoto}
              accessibilityRole="button"
              onPress={() => setIsPhotoViewerVisible(false)}
              style={StyleSheet.absoluteFill}
              testID={`${testID}-viewer-backdrop`}
            />
            <View style={styles.photoModalContent}>
              <CustomImage
                source={{ uri: imageUrl }}
                style={styles.photoModalImage}
                contentFit="contain"
                placeholder={photoBlurhash}
                placeholderContentFit="contain"
                recyclingKey={imageUrl}
                cachePolicy="memory-disk"
                testID={`${testID}-viewer-image`}
              />
              <IconButton
                accessibilityLabel={copy.closePhoto}
                icon="close"
                iconColor="#FFFFFF"
                size={28}
                onPress={() => setIsPhotoViewerVisible(false)}
                style={styles.photoModalClose}
                testID={`${testID}-viewer-close`}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', position: 'relative' },
  fallback: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  photoModal: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  photoModalContent: { alignItems: 'center', height: '85%', justifyContent: 'center', width: '100%' },
  photoModalImage: { height: '100%', width: '100%' },
  photoModalClose: { position: 'absolute', right: 0, top: 0 },
});
