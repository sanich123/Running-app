import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Button,
  Icon,
  IconButton,
  Menu,
  Searchbar,
  SegmentedButtons,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useGetGroupsQuery } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import EmptyState from '@S/empty-state/empty-state';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import { GROUP_CATEGORY_LABELS, GROUPS_COPY, GROUP_SPORTS, getGroupSportLabels } from '../const';
import GroupNotificationSettings from '../group-notification-settings/group-notification-settings';
import type { GroupListScope, GroupSport } from '@R/services/groups/types';

export default function GroupsPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = GROUPS_COPY[language];
  const sportLabels = getGroupSportLabels(language);
  const categoryLabels = GROUP_CATEGORY_LABELS[language === LANGUAGES.english ? 'en' : 'ru'];
  const [scope, setScope] = useState<GroupListScope>('all');
  const [search, setSearch] = useState('');
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [isSportMenuVisible, setIsSportMenuVisible] = useState(false);
  const [sport, setSport] = useState<GroupSport | null>(null);
  const query = useMemo(() => ({ scope, search, sport: sport ?? undefined }), [scope, search, sport]);
  const { data: groups = [], isLoading, isFetching, isError, refetch } = useGetGroupsQuery(query);
  useEffect(() => {
    if (!groups.some(({ photoPending }) => photoPending)) return;
    const interval = setInterval(() => void refetch(), 8000);
    return () => clearInterval(interval);
  }, [groups, refetch]);

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
              {copy.title}
            </Text>
          ),
          headerTitleAlign: 'left',
          headerRight: () => (
            <View style={styles.headerActions}>
              <IconButton
                icon="account-multiple-plus-outline"
                accessibilityLabel={copy.create}
                onPress={() => router.push('/groups/create' as never)}
                style={styles.headerActionButton}
                testID="groups-create-button"
              />
              <IconButton
                icon="cog-outline"
                accessibilityLabel={copy.groupNotificationSettings}
                onPress={() => setIsNotificationSettingsOpen(true)}
                style={styles.headerActionButton}
                testID="groups-settings-button"
              />
            </View>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.controls}>
          <SegmentedButtons
            value={scope}
            onValueChange={(value) => setScope(value as GroupListScope)}
            buttons={[
              { value: 'all', label: copy.allGroups },
              { value: 'mine', label: copy.myGroups },
            ]}
          />
          <View style={styles.filterRow} testID="groups-filter-row">
            <Menu
              visible={isSportMenuVisible}
              onDismiss={() => setIsSportMenuVisible(false)}
              elevation={3}
              contentStyle={[styles.sportMenu, { backgroundColor: colors.surface }]}
              anchor={
                <TouchableRipple
                  accessibilityLabel={sport ? sportLabels[sport] : copy.allActivities}
                  accessibilityRole="button"
                  onPress={() => setIsSportMenuVisible(true)}
                  rippleColor={colors.primaryContainer}
                  style={[styles.sportFilter, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
                  testID="groups-sport-filter">
                  <View style={styles.sportFilterContent}>
                    <Text variant="labelLarge" numberOfLines={1} style={{ color: colors.primary }}>
                      {sport ? sportLabels[sport] : copy.allActivities}
                    </Text>
                    <Icon source="chevron-down" size={18} color={colors.onSurfaceVariant} />
                  </View>
                </TouchableRipple>
              }>
              <Menu.Item
                title={copy.allActivities}
                trailingIcon={sport === null ? 'check' : undefined}
                testID="groups-sport-filter-all"
                onPress={() => {
                  setSport(null);
                  setIsSportMenuVisible(false);
                }}
              />
              {GROUP_SPORTS.map((activitySport) => (
                <Menu.Item
                  key={activitySport}
                  title={sportLabels[activitySport]}
                  leadingIcon={getIconNameByTypeOfSport(activitySport)}
                  trailingIcon={sport === activitySport ? 'check' : undefined}
                  testID={`groups-sport-filter-${activitySport}`}
                  onPress={() => {
                    setSport(activitySport);
                    setIsSportMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
            <Searchbar
              iconColor={colors.primary}
              mode="bar"
              placeholder={copy.search}
              searchAccessibilityLabel={copy.search}
              accessibilityLabel={copy.search}
              value={search}
              onChangeText={setSearch}
              right={() => (
                <IconButton
                  icon="close"
                  accessibilityLabel={copy.closeSearch}
                  onPress={() => setSearch('')}
                  style={styles.searchClear}
                  testID="clear-groups-search"
                />
              )}
              style={[styles.filterSearch, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
              inputStyle={styles.filterSearchInput}
              testID="search-groups"
            />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : isError ? (
          <View style={styles.feedback}>
            <EmptyState
              icon="account-group-outline"
              title={copy.loadError}
              message={
                language === LANGUAGES.russian
                  ? 'Проверьте соединение и попробуйте ещё раз.'
                  : 'Check your connection and try again.'
              }
            />
            <Button onPress={() => refetch()}>{copy.retry}</Button>
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.feedback}>
            <EmptyState
              icon="account-group-outline"
              title={search || sport ? copy.noResults : copy.emptyTitle}
              message={search || sport ? undefined : copy.emptyMessage}
            />
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(group) => group.id}
            contentContainerStyle={styles.list}
            refreshing={isFetching}
            onRefresh={refetch}
            renderItem={({ item: group }) => (
              <Pressable accessibilityRole="button" onPress={() => router.push(`/groups/${group.id}` as never)}>
                <Surface style={[styles.groupCard, { backgroundColor: colors.surface }]} elevation={1}>
                  <View style={styles.cardTop}>
                    {group.photoUrl || group.photoPreviewUrl ? (
                      <Image
                        source={{ uri: group.photoUrl ?? group.photoPreviewUrl ?? undefined }}
                        style={styles.groupPhoto}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.groupIcon, { backgroundColor: colors.primaryContainer }]}>
                        <Icon source="account-group" size={25} color={colors.primary} />
                      </View>
                    )}
                    <View style={styles.groupTitleBlock}>
                      <Text variant="titleMedium" numberOfLines={2} style={styles.groupName}>
                        {group.name}
                      </Text>
                      <View
                        accessible
                        accessibilityLabel={`${group.privacy === 'open' ? copy.open : copy.closed} · ${group.sports
                          .map((activitySport) => sportLabels[activitySport])
                          .join(', ')} · ${group.memberCount} ${copy.members}`}
                        style={styles.groupMeta}>
                        <Icon
                          source={group.privacy === 'open' ? 'earth' : 'lock-outline'}
                          size={16}
                          color={colors.onSurfaceVariant}
                        />
                        {group.sports.slice(0, 4).map((activitySport) => (
                          <Icon
                            key={activitySport}
                            source={getIconNameByTypeOfSport(activitySport)}
                            size={18}
                            color={colors.primary}
                          />
                        ))}
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                          {group.memberCount} {copy.members}
                        </Text>
                      </View>
                    </View>
                    {group.currentMembership?.status === 'pending' && (
                      <Icon source="clock-outline" size={22} color={colors.primary} />
                    )}
                  </View>
                  {!!group.description && (
                    <Text variant="bodyMedium" numberOfLines={2} style={{ color: colors.onSurfaceVariant }}>
                      {group.description}
                    </Text>
                  )}
                  {!!group.categoryTags?.length && (
                    <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                      {group.categoryTags
                        .slice(0, 3)
                        .map((tag) => categoryLabels[tag])
                        .join(' · ')}
                    </Text>
                  )}
                  <View style={styles.cardBottom}>
                    {!!group.locationName && (
                      <Text
                        variant="bodySmall"
                        numberOfLines={1}
                        style={[styles.location, { color: colors.onSurfaceVariant }]}>
                        {group.locationName}
                      </Text>
                    )}
                  </View>
                </Surface>
              </Pressable>
            )}
          />
        )}
      </View>
      {isNotificationSettingsOpen && (
        <GroupNotificationSettings visible onDismiss={() => setIsNotificationSettingsOpen(false)} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: { gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  filterRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  filterSearch: {
    borderRadius: 24,
    borderWidth: 1,
    elevation: 0,
    flex: 1,
    height: 48,
    margin: 0,
    minHeight: 48,
    width: '100%',
  },
  filterSearchInput: { fontSize: 14, lineHeight: 18, minHeight: 40, paddingVertical: 0 },
  searchClear: { height: 40, margin: 0, width: 40 },
  headerActions: { alignItems: 'center', flexDirection: 'row' },
  headerActionButton: { marginRight: 0 },
  sportFilter: { alignSelf: 'flex-start', borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  sportFilterContent: {
    alignItems: 'center',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 4,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  sportMenu: { borderRadius: 16, minWidth: 176, paddingVertical: 4 },
  loader: { flex: 1 },
  feedback: { flex: 1, justifyContent: 'center' },
  list: { gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  groupCard: { borderRadius: 16, gap: 7, padding: 12 },
  cardTop: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  groupIcon: { alignItems: 'center', borderRadius: 16, height: 48, justifyContent: 'center', width: 48 },
  groupPhoto: { borderRadius: 14, height: 48, width: 48 },
  groupTitleBlock: { flex: 1, gap: 4 },
  groupMeta: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  groupName: { fontWeight: '700' },
  cardBottom: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  location: { flex: 1, textAlign: 'right' },
});
