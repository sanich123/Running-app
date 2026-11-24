import { Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { getHeaderIconSource, HEADER_ICON_SIZE } from '@S/header-icon-source';
import { GROUPS_COPY } from '../../const';

export default function GroupsPageHeaderActions() {
  const { colors } = useTheme();
  const router = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const { create } = GROUPS_COPY[language];

  return (
    <View style={styles.headerActions}>
      <IconButton
        icon={getHeaderIconSource('plus', 'plus', colors.onSurface)}
        iconColor={Platform.OS === 'ios' ? colors.onSurface : colors.primary}
        accessibilityLabel={create}
        onPress={() => router.push('/groups/create' as never)}
        size={HEADER_ICON_SIZE}
        style={styles.headerActionButton}
        testID="groups-create-button"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerActions: { alignItems: 'center', flexDirection: 'row' },
  headerActionButton: { margin: 0 },
});
