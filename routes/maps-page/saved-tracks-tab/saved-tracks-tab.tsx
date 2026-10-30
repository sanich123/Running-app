import { useCallback, useEffect, useState } from 'react';
import * as Sharing from 'expo-sharing';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Button, Icon, IconButton, Menu, Text, TextInput, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { setNavigationTrackId } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import EmptyState from '@S/empty-state/empty-state';
import { errorToast } from '@S/error-toast/error-toast';
import {
  deleteSavedActivityTrack,
  getSavedActivityTrackFile,
  listSavedActivityTracks,
  renameSavedActivityTrack,
  subscribeToSavedActivityTracks,
  type SavedActivityTrack,
} from '@U/activity-track/track-library';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { formatDate } from '@U/time-formatter';
import type { MapsPageCopy } from '../const';

export default function SavedTracksTab({ copy }: { copy: MapsPageCopy }) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { navigationTrackId } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ settings }) => settings);
  const [tracks, setTracks] = useState<SavedActivityTrack[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const refreshTracks = useCallback(async () => {
    setIsRefreshing(true);
    try {
      setTracks(await listSavedActivityTracks());
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
      if (trackId === navigationTrackId) dispatch(setNavigationTrackId(null));
    } catch (error) {
      errorToast(copy.trackManagementFailed, error);
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
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.heading}>
        <IconButton
          icon="refresh"
          accessibilityLabel={copy.refresh}
          disabled={isRefreshing}
          onPress={() => void refreshTracks()}
        />
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
            track.sport && track.sport in MAP_SPORT_TO_TITLE ? (track.sport as keyof typeof MAP_SPORT_TO_TITLE) : null;
          const sportTitle = sportKey ? MAP_SPORT_TO_TITLE[sportKey][language] : track.sport;
          const distanceText = track.distanceMeters ? `${(track.distanceMeters / 1000).toFixed(1)} ${copy.km}` : '';

          return (
            <View
              key={track.id}
              style={[styles.trackCard, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}
              testID={`saved-track-${track.id}`}>
              <View style={styles.trackHeader}>
                <View style={[styles.routeIcon, { backgroundColor: colors.primaryContainer }]}>
                  <Icon source="map-marker-path" size={22} color={colors.primary} />
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
                    <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
                      {[formatDate(track.date, language), distanceText, sportTitle].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                )}
                {editingId === track.id ? (
                  <>
                    <IconButton
                      icon="check"
                      accessibilityLabel={copy.save}
                      onPress={() => void renameTrack(track.id)}
                    />
                    <IconButton icon="close" accessibilityLabel={copy.cancel} onPress={() => setEditingId(null)} />
                  </>
                ) : (
                  <Menu
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        accessibilityLabel={copy.trackActions}
                        testID={`track-actions-${track.id}`}
                        onPress={() => setOpenMenuId(track.id)}
                      />
                    }
                    onDismiss={() => setOpenMenuId(null)}
                    visible={openMenuId === track.id}>
                    <Menu.Item
                      leadingIcon="pencil-outline"
                      title={copy.rename}
                      onPress={() => {
                        setOpenMenuId(null);
                        setEditingId(track.id);
                        setEditedTitle(track.title);
                      }}
                    />
                    <Menu.Item
                      leadingIcon="file-download-outline"
                      title={copy.shareGpx}
                      onPress={() => {
                        setOpenMenuId(null);
                        void shareTrack(track.id, 'gpx');
                      }}
                    />
                    <Menu.Item
                      leadingIcon="file-download-outline"
                      title={copy.shareFit}
                      onPress={() => {
                        setOpenMenuId(null);
                        void shareTrack(track.id, 'fit');
                      }}
                    />
                    <Menu.Item
                      leadingIcon="delete-outline"
                      title={copy.delete}
                      onPress={() => {
                        setOpenMenuId(null);
                        void deleteTrack(track.id);
                      }}
                    />
                  </Menu>
                )}
              </View>
              {editingId === track.id ? null : (
                <Button
                  compact
                  icon="navigation-variant-outline"
                  mode="contained-tonal"
                  testID={`navigate-saved-track-${track.id}`}
                  onPress={() => navigateToTrack(track.id)}>
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
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: 12, padding: 16, paddingBottom: 24 },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end' },
  trackCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 8, padding: 12 },
  trackHeader: { alignItems: 'center', flexDirection: 'row', gap: 10, minHeight: 48 },
  routeIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  trackInfo: { flex: 1, gap: 3 },
  editInput: { flex: 1, marginVertical: 4 },
  emptyState: { margin: 0 },
});
