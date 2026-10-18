import { useState } from 'react';
import { Platform, useWindowDimensions, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TouchableRipple } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { createSearchParams } from '@R/runich-api/create-search-params';
import { useDeleteActivityMediaMutation } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import ActivityMediaDeleteBtn from '@S/activity-media/activity-media-delete-btn/activity-media-delete-btn';
import CustomImage from '@S/custom-image/custom-image';
import { errorToast } from '@S/error-toast/error-toast';
import useLongPressGuard from '@S/pressable/use-long-press-guard';
import { getMediaGridCellSize } from '../../const';
import type { ActivityMediaItem } from '@S/card/types';

export default function MediaGridImage({
  id,
  activityId,
  url,
  thumbnail,
  blurhash,
  index,
  take,
}: ActivityMediaItem & { index: number; take: number }) {
  const { push } = useRouter();
  const { width } = useWindowDimensions();
  const { id: userId } = useLocalSearchParams();
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const [deleteActivityMedia, { isLoading: isDeletingMedia }] = useDeleteActivityMediaMutation();
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(false);
  const longPressGuard = useLongPressGuard();
  const widthOfScreen = width < MAX_MOBILE_WIDTH ? width : MAX_MOBILE_WIDTH;
  const cellSize = getMediaGridCellSize(widthOfScreen);
  const canDeleteMedia = Boolean(id && activityId && userId === currentUserId);

  const handleDelete = async () => {
    if (!activityId || !id) return;
    try {
      await deleteActivityMedia({ activityId, mediaId: id }).unwrap();
      setIsDeleteButtonVisible(false);
    } catch (error) {
      errorToast('', error);
    }
  };

  return (
    <View style={[styles.container, { height: cellSize, width: cellSize }]}>
      <TouchableRipple
        testID={`media-grid-image-${id ?? index}`}
        key={url}
        onPressIn={longPressGuard.resetForGesture}
        onLongPress={
          canDeleteMedia
            ? () => {
                longPressGuard.markLongPress();
                setIsDeleteButtonVisible(true);
              }
            : undefined
        }
        disabled={isDeleteButtonVisible}
        onPress={() => {
          if (!longPressGuard.shouldHandlePress()) return;
          push(
            `/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(url) : index}${createSearchParams({
              userId,
              take,
              blurhash,
            })}`,
          );
        }}
        accessibilityRole="button"
        accessibilityLabel={url}
        borderless>
        <CustomImage
          testID={url}
          style={{ height: cellSize, width: cellSize }}
          source={{ uri: thumbnail || url }}
          contentFit="cover"
          placeholder={blurhash}
        />
      </TouchableRipple>
      {canDeleteMedia && isDeleteButtonVisible ? (
        <View style={styles.deleteButton}>
          <ActivityMediaDeleteBtn onDelete={() => void handleDelete()} isDeleting={isDeletingMedia} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  deleteButton: {
    position: 'absolute',
    right: 4,
    top: 4,
    zIndex: 2,
  },
});
