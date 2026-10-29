import { useState } from 'react';
import * as Location from 'expo-location';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Modal, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import type { MapsPageCopy } from '../const';

export default function MapSearchPanel({
  visible,
  copy,
  onDismiss,
  onSelectLocation,
}: {
  visible: boolean;
  copy: MapsPageCopy;
  onDismiss: () => void;
  onSelectLocation: (coordinate: [number, number]) => void;
}) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  async function searchLocation() {
    const normalizedQuery = query.trim();
    if (!normalizedQuery || isSearching) return;
    setIsSearching(true);
    setError('');
    try {
      const [location] = await Location.geocodeAsync(normalizedQuery);
      if (!location) {
        setError(copy.searchNoResults);
        return;
      }
      onSelectLocation([location.longitude, location.latitude]);
      onDismiss();
    } catch {
      setError(copy.searchFailed);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <Portal>
      <Modal
        contentContainerStyle={[styles.panel, { backgroundColor: colors.surface }]}
        onDismiss={onDismiss}
        visible={visible}>
        <View style={styles.heading}>
          <Text variant="titleLarge" style={{ color: colors.onSurface }}>
            {copy.search}
          </Text>
          <IconButton accessibilityLabel={copy.close} icon="close" onPress={onDismiss} />
        </View>
        <TextInput
          accessibilityLabel={copy.searchPlaceholder}
          autoFocus
          label={copy.searchPlaceholder}
          mode="outlined"
          onChangeText={setQuery}
          onSubmitEditing={() => void searchLocation()}
          returnKeyType="search"
          testID="map-search-input"
          value={query}
        />
        {error ? (
          <Text accessibilityRole="alert" style={{ color: colors.error }}>
            {error}
          </Text>
        ) : null}
        <Button disabled={!query.trim()} loading={isSearching} mode="contained" onPress={() => void searchLocation()}>
          {copy.searchSubmit}
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  panel: { alignSelf: 'center', borderRadius: 24, gap: 12, marginHorizontal: 16, padding: 16, width: '100%' },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
});
