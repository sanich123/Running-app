import { StyleSheet, View } from 'react-native';
import { Button, IconButton, useTheme } from 'react-native-paper';

export default function MapActions({
  copy,
  onImportRoute,
  onDownloadOfflineMaps,
  onShowSavedTracks,
  onShowFavoriteActivities,
}: {
  copy: { importRoute: string; downloadOfflineMaps: string; showSavedTracks: string; favoriteActivities: string };
  onImportRoute: () => void;
  onDownloadOfflineMaps: () => void;
  onShowSavedTracks: () => void;
  onShowFavoriteActivities: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.actions}>
      <View style={styles.mainActions}>
        <Button
          icon="file-import-outline"
          mode="contained"
          onPress={onImportRoute}
          style={styles.mainButton}
          testID="import-map-route">
          {copy.importRoute}
        </Button>
        <Button
          icon="download-outline"
          mode="contained"
          onPress={onDownloadOfflineMaps}
          style={styles.mainButton}
          testID="download-offline-maps">
          {copy.downloadOfflineMaps}
        </Button>
      </View>
      <View style={styles.libraryActions}>
        <IconButton
          accessibilityLabel={copy.showSavedTracks}
          icon="map-marker-path"
          mode="contained"
          onPress={onShowSavedTracks}
          style={[styles.libraryButton, { backgroundColor: colors.elevation.level3 }]}
          testID="show-saved-tracks"
        />
        <IconButton
          accessibilityLabel={copy.favoriteActivities}
          icon="bookmark-outline"
          mode="contained"
          onPress={onShowFavoriteActivities}
          style={[styles.libraryButton, { backgroundColor: colors.elevation.level3 }]}
          testID="show-favorite-activities"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: 'flex-end', gap: 12 },
  mainActions: { alignItems: 'stretch', gap: 8, width: '100%' },
  mainButton: { alignSelf: 'center', borderRadius: 14, maxWidth: 440, width: '100%' },
  libraryActions: { flexDirection: 'row', gap: 8 },
  libraryButton: { borderRadius: 24, margin: 0 },
});
