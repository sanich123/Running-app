import { Platform, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { IOS_HEADER_ITEM_WIDTH_PROPS } from '@S/header-toolbar-const';
import GroupsFilterControls from './groups-filter-controls/groups-filter-controls';
import GroupsList from './groups-list/groups-list';
import GroupsPageHeaderActions from './groups-page-header-actions/groups-page-header-actions';
import useGroupsPage from './use-groups-page';

export default function GroupsPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const page = useGroupsPage();

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <GroupsPageHeaderActions />,
        }}>
        {Platform.OS === 'ios' ? (
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button
              {...IOS_HEADER_ITEM_WIDTH_PROPS}
              icon="plus"
              accessibilityLabel={page.copy.create}
              onPress={() => router.push('/groups/create' as never)}
            />
          </Stack.Toolbar>
        ) : null}
      </Stack.Screen>
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
