import { useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, IconButton, Menu, Text, TextInput, useTheme } from 'react-native-paper';
import { errorToast } from '@S/error-toast/error-toast';
import { removeOfflineMap, renameOfflineMap } from '@U/offline-map-library';
import { formatBytes, OFFLINE_MAP_THUMBNAIL_ASPECT_RATIO } from '../utils';
import type { OfflineMapListProps } from './types';

export default function OfflineMapList({ maps, copy, onMapsChange, onOpenMap }: OfflineMapListProps) {
  const { colors } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  async function saveTitle(id: string) {
    try {
      const updatedMaps = await renameOfflineMap(id, editedTitle);
      onMapsChange(
        updatedMaps.map((offlineMap) => ({
          ...offlineMap,
          sizeBytes: maps.find(({ id: currentId }) => currentId === offlineMap.id)?.sizeBytes,
        })),
      );
      setEditingId(null);
    } catch (error) {
      errorToast(copy.mapManagementFailed, error);
    }
  }

  async function deleteMap(id: string) {
    try {
      await Mapbox.offlineManager.deletePack(id);
      const updatedMaps = await removeOfflineMap(id);
      onMapsChange(
        updatedMaps.map((offlineMap) => ({
          ...offlineMap,
          sizeBytes: maps.find(({ id: currentId }) => currentId === offlineMap.id)?.sizeBytes,
        })),
      );
    } catch (error) {
      errorToast(copy.mapManagementFailed, error);
    }
  }

  return maps.map((offlineMap) => (
    <View
      key={offlineMap.id}
      style={[styles.row, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}>
      {editingId === offlineMap.id ? (
        <>
          <View
            style={[
              styles.thumbnail,
              {
                aspectRatio: offlineMap.thumbnailAspectRatio ?? OFFLINE_MAP_THUMBNAIL_ASPECT_RATIO,
                backgroundColor: colors.surfaceVariant,
              },
            ]}>
            {offlineMap.thumbnailUri ? (
              <Image source={{ uri: offlineMap.thumbnailUri }} contentFit="contain" style={styles.thumbnailImage} />
            ) : (
              <Icon source="map-outline" size={28} color={colors.onSurfaceVariant} />
            )}
          </View>
          <TextInput mode="outlined" dense value={editedTitle} onChangeText={setEditedTitle} style={styles.editInput} />
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${copy.openMap}: ${offlineMap.title}`}
          onPress={() => onOpenMap?.(offlineMap)}
          style={styles.mapContent}
          testID={`open-offline-map-${offlineMap.id}`}>
          <View
            style={[
              styles.thumbnail,
              {
                aspectRatio: offlineMap.thumbnailAspectRatio ?? OFFLINE_MAP_THUMBNAIL_ASPECT_RATIO,
                backgroundColor: colors.surfaceVariant,
              },
            ]}>
            {offlineMap.thumbnailUri ? (
              <Image source={{ uri: offlineMap.thumbnailUri }} contentFit="contain" style={styles.thumbnailImage} />
            ) : (
              <Icon source="map-outline" size={28} color={colors.onSurfaceVariant} />
            )}
          </View>
          <View style={styles.mapInfo}>
            <Text variant="bodyLarge" style={{ color: colors.onSurface }}>
              {offlineMap.title}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {offlineMap.sizeBytes === undefined ? '—' : formatBytes(offlineMap.sizeBytes)}
            </Text>
          </View>
        </Pressable>
      )}
      {editingId === offlineMap.id ? (
        <View style={styles.actions}>
          <IconButton
            icon="check"
            accessibilityLabel={copy.save}
            onPress={() => void saveTitle(offlineMap.id)}
            style={styles.actionButton}
          />
          <IconButton
            icon="close"
            accessibilityLabel={copy.cancel}
            onPress={() => setEditingId(null)}
            style={styles.actionButton}
          />
        </View>
      ) : (
        <Menu
          visible={openMenuId === offlineMap.id}
          onDismiss={() => setOpenMenuId(null)}
          contentStyle={{
            backgroundColor: colors.surface,
            borderColor: colors.outlineVariant,
            borderRadius: 14,
            borderWidth: StyleSheet.hairlineWidth,
          }}
          anchor={
            <IconButton
              icon="dots-vertical"
              accessibilityLabel={copy.mapActions}
              accessibilityRole="button"
              accessibilityState={{ expanded: openMenuId === offlineMap.id }}
              onPress={() => setOpenMenuId(offlineMap.id)}
              style={styles.actionButton}
              testID={`offline-map-actions-${offlineMap.id}`}
            />
          }>
          <Menu.Item
            leadingIcon="pencil-outline"
            title={copy.rename}
            onPress={() => {
              setOpenMenuId(null);
              setEditingId(offlineMap.id);
              setEditedTitle(offlineMap.title);
            }}
          />
          <Menu.Item
            leadingIcon="delete-outline"
            title={copy.delete}
            titleStyle={{ color: colors.error }}
            onPress={() => {
              setOpenMenuId(null);
              void deleteMap(offlineMap.id);
            }}
          />
        </Menu>
      )}
    </View>
  ));
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 88,
    padding: 10,
    gap: 12,
  },
  thumbnail: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 96,
  },
  thumbnailImage: { height: '100%', width: '100%' },
  mapContent: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12, minHeight: 68 },
  mapInfo: { flex: 1, gap: 2, paddingVertical: 10 },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  actionButton: { height: 40, margin: 0, width: 40 },
  editInput: { flex: 1, marginVertical: 4 },
});
