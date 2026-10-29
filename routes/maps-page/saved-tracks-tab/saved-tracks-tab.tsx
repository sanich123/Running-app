import { useCallback, useEffect, useState } from 'react';
import * as Sharing from 'expo-sharing';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Button, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { setNavigationTrackId } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import {
  deleteSavedActivityTrack,
  getSavedActivityTrackFile,
  listSavedActivityTracks,
  renameSavedActivityTrack,
  type SavedActivityTrack,
} from '@U/activity-track/track-library';
import type { MapsPageCopy } from '../const';

export default function SavedTracksTab({ copy }: { copy: MapsPageCopy }) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { navigationTrackId } = useAppSelector(({ location }) => location);
  const [tracks, setTracks] = useState<SavedActivityTrack[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
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
        <Text variant="titleMedium" style={{ color: colors.onSurface }}>
          {copy.tracks}
        </Text>
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
        tracks.map((track) => (
          <View
            key={track.id}
            style={[styles.trackCard, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}>
            <View style={styles.row}>
              {editingId === track.id ? (
                <TextInput
                  mode="outlined"
                  dense
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  style={styles.editInput}
                />
              ) : (
                <View style={styles.trackInfo}>
                  <Text variant="titleSmall" style={{ color: colors.onSurface }}>
                    {track.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {new Date(track.date).toLocaleDateString()} · {track.pointCount} {copy.pointCount}
                  </Text>
                </View>
              )}
              {editingId === track.id ? (
                <>
                  <IconButton icon="check" accessibilityLabel={copy.save} onPress={() => void renameTrack(track.id)} />
                  <IconButton icon="close" accessibilityLabel={copy.cancel} onPress={() => setEditingId(null)} />
                </>
              ) : (
                <>
                  <IconButton
                    icon="pencil-outline"
                    accessibilityLabel={copy.rename}
                    onPress={() => {
                      setEditingId(track.id);
                      setEditedTitle(track.title);
                    }}
                  />
                  <IconButton
                    icon="delete-outline"
                    accessibilityLabel={copy.delete}
                    onPress={() => void deleteTrack(track.id)}
                  />
                </>
              )}
            </View>
            {editingId === track.id ? null : (
              <View style={styles.trackActions}>
                <Button
                  compact
                  mode="contained-tonal"
                  testID={`navigate-saved-track-${track.id}`}
                  onPress={() => navigateToTrack(track.id)}>
                  {copy.navigate}
                </Button>
                <Button
                  compact
                  testID={`share-saved-track-${track.id}-gpx`}
                  onPress={() => void shareTrack(track.id, 'gpx')}>
                  {copy.shareGpx}
                </Button>
                <Button
                  compact
                  testID={`share-saved-track-${track.id}-fit`}
                  onPress={() => void shareTrack(track.id, 'fit')}>
                  {copy.shareFit}
                </Button>
              </View>
            )}
          </View>
        ))
      ) : (
        <Text style={{ color: colors.onSurfaceVariant }}>{copy.noTracks}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: 12, padding: 16, paddingBottom: 32 },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  row: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 56 },
  editInput: { flex: 1, marginVertical: 4 },
  trackCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingVertical: 4 },
  trackInfo: { flex: 1, gap: 4 },
  trackActions: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-start' },
});
