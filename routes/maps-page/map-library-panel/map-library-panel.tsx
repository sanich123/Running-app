import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Modal, Portal, Text, useTheme } from 'react-native-paper';
import OfflineMapsTab from '../offline-maps-tab/offline-maps-tab';
import SavedTracksTab from '../saved-tracks-tab/saved-tracks-tab';
import type { MapTab, MapsPageCopy } from '../const';

export default function MapLibraryPanel({
  visible,
  tab,
  copy,
  onTabChange,
  onDismiss,
}: {
  visible: boolean;
  tab: MapTab;
  copy: MapsPageCopy;
  onTabChange: (tab: MapTab) => void;
  onDismiss: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Portal>
      <Modal
        contentContainerStyle={[styles.panel, { backgroundColor: colors.surface }]}
        onDismiss={onDismiss}
        visible={visible}>
        <View style={styles.heading}>
          <Text variant="titleLarge" style={{ color: colors.onSurface }}>
            {copy.title}
          </Text>
          <IconButton accessibilityLabel={copy.close} icon="close" onPress={onDismiss} />
        </View>
        <View style={styles.tabs}>
          <Button mode={tab === 'maps' ? 'contained' : 'outlined'} onPress={() => onTabChange('maps')}>
            {copy.maps}
          </Button>
          <Button mode={tab === 'tracks' ? 'contained' : 'outlined'} onPress={() => onTabChange('tracks')}>
            {copy.tracks}
          </Button>
        </View>
        {tab === 'maps' ? <OfflineMapsTab copy={copy} /> : <SavedTracksTab copy={copy} />}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignSelf: 'center',
    borderRadius: 24,
    flex: 1,
    gap: 12,
    height: '86%',
    marginHorizontal: 12,
    overflow: 'hidden',
    padding: 16,
    width: '100%',
  },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  tabs: { flexDirection: 'row', gap: 8 },
});
