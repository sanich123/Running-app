import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useAppSelector } from '@R/typed-hooks';
import ActivityMediaItem from './activity-media-item/activity-media-item';
import { getActivityMediaDimensions, getDisplayedMediaData } from './utils';
import { useActivityCard } from '../context';
import type { DisplayedMediaItem } from './types';

export default function MediaList() {
  const { activity, isFullView } = useActivityCard();
  const { media, mapPhotoUrl, routeOnlyMapPhotoUrl, hideMap, userId: activityOwnerId, mapPhotoUrlBlurhash } = activity;
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { width } = useWindowDimensions();
  const mediaListRef = useRef<FlatList<DisplayedMediaItem>>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const { mediaWidth, mediaHeight } = getActivityMediaDimensions(width);
  const initialMediaOffset = mediaWidth / 2;
  const isOwnActivity = activityOwnerId === currentUserId;
  const displayedMapPhotoUrl = hideMap
    ? isOwnActivity
      ? (mapPhotoUrl ?? routeOnlyMapPhotoUrl)
      : routeOnlyMapPhotoUrl
    : mapPhotoUrl;
  const displayedData = useMemo(
    () => getDisplayedMediaData(media, displayedMapPhotoUrl, hideMap, mapPhotoUrlBlurhash),
    [displayedMapPhotoUrl, hideMap, mapPhotoUrlBlurhash, media],
  );
  const showSideBySideMedia = !isFullView && displayedData.length > 1;
  const shouldApplyInitialOffset = useRef(showSideBySideMedia);

  const handleMediaContentSizeChange = useCallback(() => {
    if (!showSideBySideMedia || !shouldApplyInitialOffset.current || !mediaListRef.current) return;

    shouldApplyInitialOffset.current = false;
    mediaListRef.current.scrollToOffset({ offset: initialMediaOffset, animated: false });
  }, [initialMediaOffset, showSideBySideMedia]);
  const handleToggleDelete = useCallback((mediaId: string) => {
    setSelectedMediaId((selectedId) => (selectedId === mediaId ? null : mediaId));
  }, []);
  const handleMediaDeleted = useCallback(() => setSelectedMediaId(null), []);
  const renderItem = useCallback(
    ({ item, index }: { item: DisplayedMediaItem; index: number }) => (
      <ActivityMediaItem
        item={item}
        index={index}
        selectedMediaId={selectedMediaId}
        onToggleDelete={handleToggleDelete}
        onDeleteSuccess={handleMediaDeleted}
      />
    ),
    [handleMediaDeleted, handleToggleDelete, selectedMediaId],
  );

  return displayedData.length ? (
    <FlatList
      ref={mediaListRef}
      data={displayedData}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={Platform.OS === 'web' ? { flexGrow: 0, height: mediaHeight + 8 } : undefined}
      testID="activity-media-list"
      contentContainerStyle={styles.listContent}
      onContentSizeChange={handleMediaContentSizeChange}
      initialNumToRender={Math.max(1, Math.min(displayedData.length, 3))}
      maxToRenderPerBatch={3}
      windowSize={5}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={false}
      ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      keyExtractor={({ id, url }, index) => id ?? url ?? String(index)}
    />
  ) : null;
}

const styles = StyleSheet.create({
  listContent: { paddingVertical: 4 },
  itemSeparator: { width: 8 },
});
