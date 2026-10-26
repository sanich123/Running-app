import { Fragment, useCallback, useState } from 'react';
import { Platform, View, useWindowDimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import {
  activityApi,
  useDeleteActivityMediaMutation,
  useGetAllActivityMediaByUserIdInfiniteQuery,
} from '@R/services/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ActivityMediaDeleteBtn from '@S/activity-media/activity-media-delete-btn/activity-media-delete-btn';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import MediaModerationPlaceholder from '@S/media-moderation-placeholder/media-moderation-placeholder';
import MediaThumbnail from '@S/media-thumbnail/media-thumbnail';
import useLongPressGuard from '@S/pressable/use-long-press-guard';
import { MEDIA_GRID_PAGE_SIZE } from '../../../media-grid/const';
import { PROFILE_MEDIA } from '../const';
import type { ActivityMediaItem } from '@S/card/types';

export default function ProfileMediaPhotos({ userId }: { userId: string }) {
  const {
    isLoading,
    isError,
    data: pages,
    error,
  } = useGetAllActivityMediaByUserIdInfiniteQuery({ userId, take: 4 }, { skip: !userId });
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const [deleteActivityMedia, { isLoading: isDeletingMedia }] = useDeleteActivityMediaMutation();
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const longPressGuard = useLongPressGuard();
  const widthOfScreen = width < MAX_MOBILE_WIDTH ? width : MAX_MOBILE_WIDTH;
  const data = pages?.pages[0];
  const media = data?.media ?? [];
  const visibleMedia = media.filter((item) => item.mediaReviewStatus !== 'rejected');
  const isOwnProfile = userId === currentUserId;

  const handleDeleteMedia = useCallback(
    async (mediaId: string, activityId: string) => {
      try {
        await deleteActivityMedia({ activityId, mediaId }).unwrap();
        setSelectedMediaId(null);
      } catch (deleteError) {
        errorToast('', deleteError);
      }
    },
    [deleteActivityMedia],
  );

  if (!isLoading && !isError && !visibleMedia.length) {
    return null;
  }

  return (
    <View
      style={[
        styles.layout,
        {
          backgroundColor: colors.background,
          width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
        (isLoading || isError) && styles.isInCenter,
      ]}>
      {isError && (
        <Text variant="bodyLarge">{`${PROFILE_MEDIA[language].error}: ${getErrorMessageFromError(error)}`}</Text>
      )}
      {visibleMedia.length > 0 &&
        visibleMedia.map((item: ActivityMediaItem, index: number) => {
          const { id, activityId, url, thumbnail, blurhash, contentType } = item;
          const canDeleteMedia = Boolean(isOwnProfile && id && activityId);
          if (index === 3) {
            return (
              <Fragment key={id ?? `${url}+${index}`}>
                <View style={[styles.lastImageWrapper, { width: widthOfScreen / 4, height: widthOfScreen / 4 }]}>
                  <TouchableRipple
                    testID={`profile-activity-media-${id ?? index}`}
                    style={{ width: widthOfScreen / 4, height: widthOfScreen / 4 }}
                    onPressIn={longPressGuard.resetForGesture}
                    onPress={() => {
                      if (!longPressGuard.shouldHandlePress()) return;
                      void dispatch(
                        activityApi.endpoints.getAllActivityMediaByUserId.initiate(
                          { userId, take: MEDIA_GRID_PAGE_SIZE },
                          { subscribe: false },
                        ),
                      );
                      push(`/${ROUTES.mediaGrid}/${userId}`);
                    }}
                    onLongPress={
                      canDeleteMedia
                        ? () => {
                            longPressGuard.markLongPress();
                            setSelectedMediaId(id ?? null);
                          }
                        : undefined
                    }
                    accessibilityRole="button"
                    accessibilityLabel={PROFILE_MEDIA[language].label}
                    disabled={isError || isLoading || selectedMediaId === id}
                    borderless>
                    {url ? (
                      <MediaThumbnail
                        style={{ width: widthOfScreen / 4, height: widthOfScreen / 4 }}
                        mediaUrl={url}
                        thumbnail={thumbnail}
                        isVideo={contentType?.startsWith('video/') || undefined}
                        placeholder={blurhash}
                      />
                    ) : (
                      <MediaModerationPlaceholder
                        status={item.mediaReviewStatus}
                        blurhash={item.blurhash}
                        borderRadius={10}
                        compact
                        hideTitle={widthOfScreen / 4 < 130}
                        showStatus={false}
                      />
                    )}
                  </TouchableRipple>
                  {!isOwnProfile &&
                  item.mediaReviewStatus &&
                  item.mediaReviewStatus !== 'approved' &&
                  item.mediaReviewStatus !== 'rejected' ? (
                    <MediaModerationPlaceholder status={item.mediaReviewStatus} compact overlay />
                  ) : null}
                  <View pointerEvents="none" style={styles.labelBackdrop}>
                    <Text style={styles.label} variant="labelLarge">
                      {PROFILE_MEDIA[language].label}
                    </Text>
                  </View>
                  {canDeleteMedia && selectedMediaId === id && activityId ? (
                    <View style={styles.deleteButton}>
                      <ActivityMediaDeleteBtn
                        onDelete={() => void handleDeleteMedia(id!, activityId)}
                        isDeleting={isDeletingMedia}
                      />
                    </View>
                  ) : null}
                </View>
              </Fragment>
            );
          }
          return (
            <View
              key={id ?? `${url}+${index}`}
              style={[styles.imageWrapper, { width: widthOfScreen / 4, height: widthOfScreen / 4 }]}>
              <TouchableRipple
                testID={`profile-activity-media-${id ?? index}`}
                style={{ width: widthOfScreen / 4, height: widthOfScreen / 4 }}
                onPressIn={longPressGuard.resetForGesture}
                onPress={() => {
                  if (!longPressGuard.shouldHandlePress()) return;
                  void dispatch(
                    activityApi.endpoints.getAllActivityMediaByUserId.initiate(
                      { userId, take: MEDIA_GRID_PAGE_SIZE },
                      { subscribe: false },
                    ),
                  );
                  push(`/${ROUTES.mediaGrid}/${userId}`);
                }}
                onLongPress={
                  canDeleteMedia
                    ? () => {
                        longPressGuard.markLongPress();
                        setSelectedMediaId(id ?? null);
                      }
                    : undefined
                }
                accessibilityRole="button"
                accessibilityLabel={PROFILE_MEDIA[language].label}
                disabled={isError || isLoading || selectedMediaId === id}
                borderless>
                {url ? (
                  <MediaThumbnail
                    style={{ width: widthOfScreen / 4, height: widthOfScreen / 4 }}
                    mediaUrl={url}
                    thumbnail={thumbnail}
                    isVideo={contentType?.startsWith('video/') || undefined}
                    placeholder={blurhash}
                  />
                ) : (
                  <MediaModerationPlaceholder
                    status={item.mediaReviewStatus}
                    blurhash={item.blurhash}
                    borderRadius={10}
                    compact
                    hideTitle={widthOfScreen / 4 < 130}
                    showStatus={false}
                  />
                )}
              </TouchableRipple>
              {!isOwnProfile &&
              item.mediaReviewStatus &&
              item.mediaReviewStatus !== 'approved' &&
              item.mediaReviewStatus !== 'rejected' ? (
                <MediaModerationPlaceholder status={item.mediaReviewStatus} compact overlay />
              ) : null}
              {canDeleteMedia && selectedMediaId === id && activityId ? (
                <View style={styles.deleteButton}>
                  <ActivityMediaDeleteBtn
                    onDelete={() => void handleDeleteMedia(id!, activityId)}
                    isDeleting={isDeletingMedia}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    flexDirection: 'row',
  },
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastImageWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
  },
  deleteButton: {
    position: 'absolute',
    right: 4,
    top: 4,
    zIndex: 2,
  },
  labelBackdrop: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.64)',
    borderColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
