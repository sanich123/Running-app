import { useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { errorToast } from '@S/error-toast/error-toast';
import { removeOfflineMap, renameOfflineMap, type SavedOfflineMap } from '@U/offline-map-library';
import type { MapsPageCopy } from '../../const';

export default function OfflineMapList({
  maps,
  copy,
  onMapsChange,
}: {
  maps: SavedOfflineMap[];
  copy: MapsPageCopy;
  onMapsChange: (maps: SavedOfflineMap[]) => void;
}) {
  const { colors } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  async function saveTitle(id: string) {
    try {
      onMapsChange(await renameOfflineMap(id, editedTitle));
      setEditingId(null);
    } catch (error) {
      errorToast(copy.mapManagementFailed, error);
    }
  }

  async function deleteMap(id: string) {
    try {
      await Mapbox.offlineManager.deletePack(id);
      onMapsChange(await removeOfflineMap(id));
    } catch (error) {
      errorToast(copy.mapManagementFailed, error);
    }
  }

  return maps.map((offlineMap) => (
    <View key={offlineMap.id} style={[styles.row, { borderColor: colors.outlineVariant }]}>
      {editingId === offlineMap.id ? (
        <TextInput mode="outlined" dense value={editedTitle} onChangeText={setEditedTitle} style={styles.editInput} />
      ) : (
        <Text variant="bodyLarge" style={[styles.rowTitle, { color: colors.onSurface }]}>
          {offlineMap.title}
        </Text>
      )}
      {editingId === offlineMap.id ? (
        <>
          <IconButton icon="check" accessibilityLabel={copy.save} onPress={() => void saveTitle(offlineMap.id)} />
          <IconButton icon="close" accessibilityLabel={copy.cancel} onPress={() => setEditingId(null)} />
        </>
      ) : (
        <>
          <IconButton
            icon="pencil-outline"
            accessibilityLabel={copy.rename}
            onPress={() => {
              setEditingId(offlineMap.id);
              setEditedTitle(offlineMap.title);
            }}
          />
          <IconButton
            icon="delete-outline"
            accessibilityLabel={copy.delete}
            onPress={() => void deleteMap(offlineMap.id)}
          />
        </>
      )}
    </View>
  ));
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 56 },
  rowTitle: { flex: 1 },
  editInput: { flex: 1, marginVertical: 4 },
});
