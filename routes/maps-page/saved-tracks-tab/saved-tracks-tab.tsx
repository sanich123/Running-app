import { useCallback, useEffect, useState } from 'react';
import * as Sharing from 'expo-sharing';
import { SymbolView } from 'expo-symbols';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Button, Icon, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { setNavigationTrackId } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import EmptyState from '@S/empty-state/empty-state';
import { errorToast } from '@S/error-toast/error-toast';
import {
  deleteSavedActivityTrack,
  deleteAllSavedActivityTracks,
  getSavedActivityTracksStorageBytes,
  getSavedActivityTrackFile,
  listSavedActivityTracks,
  renameSavedActivityTrack,
  subscribeToSavedActivityTracks,
  type SavedActivityTrack,
} from '@U/activity-track/track-library';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { formatSavedTrackCount, formatStorageSize } from './utils';
import { formatRouteActivityDate } from '../add-track-page/utils';
import TrackActionsMenu from './track-actions-menu/track-actions-menu';
import type { MapsPageCopy } from '../const';

export default function SavedTracksTab({ copy }: { copy: MapsPageCopy }) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { navigationTrackId } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ settings }) => settings);
  const [tracks, setTracks] = useState<SavedActivityTrack[]>([]);
  const [storageBytes, setStorageBytes] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isClearingTracks, setIsClearingTracks] = useState(false);
  const [isClearAllDialogVisible, setIsClearAllDialogVisible] = useState(false);

  const refreshTracks = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [savedTracks, savedTrackStorageBytes] = await Promise.all([
        listSavedActivityTracks(),
        getSavedActivityTracksStorageBytes(),
      ]);
      setTracks(savedTracks);
      setStorageBytes(savedTrackStorageBytes);
      setHasError(false);
    } catch (error) {
      setHasError(true);
      errorToast(copy.libraryLoadFailed, error);
    } finally {
      setHasLoaded(true);
      setIsRefreshing(false);
    }
  }, [copy.libraryLoadFailed]);

  useEffect(() => {
    void Promise.resolve().then(refreshTracks);
    return subscribeToSavedActivityTracks?.(() => void refreshTracks());
  }, [refreshTracks]);

  async function renameTrack(trackId: string) {
    try {
      setTracks(await renameSavedActivityTrack(trackId, editedTitle));
      setEditingId(null);
    } catch (error) {
      errorToast(copy.trackManagementFailed, error);
    }
  }

  async function deleteTrack(trackId: string) {
    try {
      setTracks(await deleteSavedActivityTrack(trackId));
      setStorageBytes(await getSavedActivityTracksStorageBytes());
      if (trackId === navigationTrackId) dispatch(setNavigationTrackId(null));
    } catch (error) {
      errorToast(copy.trackManagementFailed, error);
    }
  }

  async function clearAllTracks() {
    setIsClearingTracks(true);
    try {
      setTracks(await deleteAllSavedActivityTracks());
      setStorageBytes(0);
      setEditingId(null);
      dispatch(setNavigationTrackId(null));
      setIsClearAllDialogVisible(false);
    } catch (error) {
      errorToast(copy.trackManagementFailed, error);
    } finally {
      setIsClearingTracks(false);
    }
  }

  async function shareTrack(trackId: string, format: 'gpx' | 'fit') {
    try {
      const file = await getSavedActivityTrackFile(trackId, format);
      if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device');
      await Sharing.shareAsync(file.uri, {
        dialogTitle: format === 'gpx' ? copy.shareGpx : copy.shareFit,
        mimeType: format === 'gpx' ? 'application/gpx+xml' : 'application/vnd.ant.fit',
      });
    } catch (error) {
      errorToast(copy.trackShareFailed, error);
    }
  }

  function navigateToTrack(trackId: string) {
    dispatch(setNavigationTrackId(trackId));
    push(`/${ROUTES.tabs}/${ROUTES.activity}` as never);
  }

  return (
    <>
      <ScrollView
        alwaysBounceVertical
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={() => void refreshTracks()}
            progressBackgroundColor={colors.elevation.level3}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        }
        style={styles.scroll}>
        <View style={[styles.storageSummary, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <View style={styles.storageSummaryText}>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {formatSavedTrackCount(tracks.length, language)} · {formatStorageSize(storageBytes, language)}
            </Text>
          </View>
          <Button
            compact
            mode="text"
            icon={({ size, color }) =>
              Platform.OS === 'ios' ? (
                <SymbolView name="trash" size={size} tintColor={color} />
              ) : (
                <Icon source="delete-sweep-outline" size={size} color={color} />
              )
            }
            disabled={!tracks.length || isClearingTracks || isRefreshing}
            loading={isClearingTracks}
            onPress={() => setIsClearAllDialogVisible(true)}
            testID="clear-all-saved-tracks">
            {copy.clearAllTracks}
          </Button>
        </View>
        {!hasLoaded ? (
          <ActivityIndicator />
        ) : hasError ? (
          <Button mode="outlined" loading={isRefreshing} onPress={() => void refreshTracks()}>
            {copy.retry}
          </Button>
        ) : tracks.length ? (
          tracks.map((track) => {
            const sportKey =
              track.sport && track.sport in MAP_SPORT_TO_TITLE
                ? (track.sport as keyof typeof MAP_SPORT_TO_TITLE)
                : null;
            const sportTitle = sportKey ? MAP_SPORT_TO_TITLE[sportKey][language] : track.sport;
            const distanceText =
              typeof track.distanceMeters === 'number' ? `${(track.distanceMeters / 1000).toFixed(1)} ${copy.km}` : '';

            return (
              <View
                key={track.id}
                style={[styles.trackCard, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}
                testID={`saved-track-${track.id}`}>
                <View style={styles.trackHeader}>
                  <View style={[styles.routeIcon, { backgroundColor: colors.primaryContainer }]}>
                    {Platform.OS === 'ios' ? (
                      <SymbolView name="map" size={24} tintColor={colors.primary} />
                    ) : (
                      <Icon source="map-marker-path" size={22} color={colors.primary} />
                    )}
                  </View>
                  {editingId === track.id ? (
                    <TextInput
                      accessibilityLabel={copy.rename}
                      mode="outlined"
                      dense
                      value={editedTitle}
                      onChangeText={setEditedTitle}
                      style={styles.editInput}
                    />
                  ) : (
                    <View style={styles.trackInfo}>
                      <Text variant="titleSmall" numberOfLines={1} style={{ color: colors.onSurface }}>
                        {track.title}
                      </Text>
                      <Text variant="bodySmall" numberOfLines={2} style={{ color: colors.onSurfaceVariant }}>
                        {[formatRouteActivityDate(track.date, language), distanceText, sportTitle]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </View>
                  )}
                  {editingId === track.id ? (
                    <View style={styles.editActions}>
                      <IconButton
                        icon={({ size, color }) =>
                          Platform.OS === 'ios' ? (
                            <SymbolView name="checkmark" size={size} tintColor={color} />
                          ) : (
                            <Icon source="check" size={size} color={color} />
                          )
                        }
                        accessibilityLabel={copy.save}
                        onPress={() => void renameTrack(track.id)}
                        style={styles.editActionButton}
                      />
                      <IconButton
                        icon={({ size, color }) =>
                          Platform.OS === 'ios' ? (
                            <SymbolView name="xmark" size={size} tintColor={color} />
                          ) : (
                            <Icon source="close" size={size} color={color} />
                          )
                        }
                        accessibilityLabel={copy.cancel}
                        onPress={() => setEditingId(null)}
                        style={styles.editActionButton}
                      />
                    </View>
                  ) : (
                    <TrackActionsMenu
                      accessibilityLabel={copy.trackActions}
                      testID={`track-actions-${track.id}`}
                      actions={[
                        {
                          label: copy.rename,
                          testID: `rename-track-${track.id}`,
                          leadingIcon: 'pencil-outline',
                          systemImage: 'pencil',
                          onPress: () => {
                            setEditingId(track.id);
                            setEditedTitle(track.title);
                          },
                        },
                        {
                          label: copy.shareGpx,
                          testID: `share-gpx-${track.id}`,
                          leadingIcon: 'file-download-outline',
                          systemImage: 'arrow.down.doc',
                          onPress: () => void shareTrack(track.id, 'gpx'),
                        },
                        {
                          label: copy.shareFit,
                          testID: `share-fit-${track.id}`,
                          leadingIcon: 'file-download-outline',
                          systemImage: 'arrow.down.doc',
                          onPress: () => void shareTrack(track.id, 'fit'),
                        },
                        {
                          label: copy.delete,
                          testID: `delete-track-${track.id}`,
                          leadingIcon: 'delete-outline',
                          systemImage: 'trash',
                          destructive: true,
                          onPress: () => void deleteTrack(track.id),
                        },
                      ]}
                    />
                  )}
                </View>
                {editingId === track.id ? null : (
                  <Button
                    compact
                    icon={({ size, color }) =>
                      Platform.OS === 'ios' ? (
                        <SymbolView name="location.north.fill" size={size} tintColor={color} />
                      ) : (
                        <Icon source="navigation-variant" size={size} color={color} />
                      )
                    }
                    mode="contained-tonal"
                    testID={`navigate-saved-track-${track.id}`}
                    onPress={() => navigateToTrack(track.id)}
                    style={styles.navigateButton}
                    contentStyle={styles.navigateButtonContent}
                    labelStyle={styles.navigateButtonLabel}>
                    {copy.navigate}
                  </Button>
                )}
              </View>
            );
          })
        ) : (
          <EmptyState
            icon="map-marker-path"
            title={copy.noTracks}
            message={copy.noTracksMessage}
            style={styles.emptyState}
          />
        )}
      </ScrollView>
      <ConfirmDialog
        visible={isClearAllDialogVisible}
        title={copy.clearTracksConfirmTitle}
        message={copy.clearTracksConfirmMessage}
        confirmText={copy.clearAllTracks}
        cancelText={copy.cancel}
        destructive
        loading={isClearingTracks}
        onDismiss={() => setIsClearAllDialogVisible(false)}
        onConfirm={() => void clearAllTracks()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: 12, padding: 16, paddingBottom: 24 },
  storageSummary: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  storageSummaryText: { flex: 1, gap: 2 },
  trackCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 6, padding: 10 },
  trackHeader: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  routeIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  trackInfo: { flex: 1, gap: 2 },
  editInput: { flex: 1, marginVertical: 0, minHeight: 48 },
  editActions: { alignItems: 'center', flexDirection: 'row', gap: 0 },
  editActionButton: { height: 40, margin: 0, width: 40 },
  navigateButton: { marginVertical: 0, minHeight: 40 },
  navigateButtonContent: { height: 40 },
  navigateButtonLabel: { fontSize: 15, lineHeight: 20, marginVertical: 0 },
  emptyState: { margin: 0 },
});
