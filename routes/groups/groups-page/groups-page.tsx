import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { FONT_FAMILIES } from '@const/fonts';
import GroupsFilterControls from './groups-filter-controls/groups-filter-controls';
import GroupsList from './groups-list/groups-list';
import GroupsPageHeaderActions from './groups-page-header-actions/groups-page-header-actions';
import useGroupsPage from './use-groups-page';

export default function GroupsPage() {
  const { colors } = useTheme();
  const page = useGroupsPage();
  const {
    copy: { title },
  } = page;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text
              numberOfLines={1}
              style={{
                color: colors.primary,
                fontFamily: FONT_FAMILIES.semiBold,
                fontSize: 16,
                transform: [{ translateY: -2 }],
              }}>
              {title}
            </Text>
          ),
          headerTitleAlign: 'left',
          headerRight: () => <GroupsPageHeaderActions />,
        }}
      />
      <View
        style={[
          styles.container,
          Platform.OS === 'web' && styles.webContainer,
          { backgroundColor: colors.background },
        ]}>
        <GroupsFilterControls filters={page.filters} onChange={page.setFilters} />
        <GroupsList filters={page.query} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webContainer: { alignSelf: 'center', maxWidth: MAX_MOBILE_WIDTH, width: '100%' },
});
