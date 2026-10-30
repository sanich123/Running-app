import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Icon,
  Searchbar,
  SegmentedButtons,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useGetGroupsQuery } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import EmptyState from '@S/empty-state/empty-state';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import { GROUP_CATEGORY_LABELS, GROUPS_COPY, GROUP_SPORTS, getGroupSportLabels } from '../const';
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
  const [sport, setSport] = useState<GroupSport | null>(null);
  const query = useMemo(() => ({ scope, search, sport: sport ?? undefined }), [scope, search, sport]);
  const { data: groups = [], isLoading, isFetching, isError, refetch } = useGetGroupsQuery(query);

  return (
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
        <Searchbar placeholder={copy.search} value={search} onChangeText={setSearch} style={styles.search} />
        <View style={styles.sports}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: sport === null }}
            onPress={() => setSport(null)}
            style={[
              styles.sportChip,
              { backgroundColor: sport === null ? colors.primaryContainer : colors.surfaceVariant },
            ]}>
            <Text variant="bodySmall" style={{ color: sport === null ? colors.primary : colors.onSurfaceVariant }}>
              {copy.allActivities}
            </Text>
          </Pressable>
          {GROUP_SPORTS.map((activitySport) => (
            <Pressable
              key={activitySport}
              accessibilityRole="button"
              accessibilityLabel={sportLabels[activitySport]}
              accessibilityState={{ selected: sport === activitySport }}
              testID={`groups-sport-filter-${activitySport}`}
              onPress={() => setSport(sport === activitySport ? null : activitySport)}
              style={[
                styles.sportChip,
                { backgroundColor: sport === activitySport ? colors.primaryContainer : colors.surfaceVariant },
              ]}>
              <Icon
                source={getIconNameByTypeOfSport(activitySport)}
                size={18}
                color={sport === activitySport ? colors.primary : colors.onSurfaceVariant}
              />
              <Text
                variant="bodySmall"
                style={{ color: sport === activitySport ? colors.primary : colors.onSurfaceVariant }}>
                {sportLabels[activitySport]}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button
          mode="contained"
          testID="groups-create-button"
          icon="account-multiple-plus-outline"
          onPress={() => router.push('/groups/create' as never)}>
          {copy.create}
        </Button>
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
                  {group.photoUrl ? (
                    <Avatar.Image size={48} source={{ uri: group.photoUrl }} />
                  ) : (
                    <View style={[styles.groupIcon, { backgroundColor: colors.primaryContainer }]}>
                      <Icon source="account-group" size={25} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.groupTitleBlock}>
                    <Text variant="titleMedium" numberOfLines={2} style={styles.groupName}>
                      {group.name}
                    </Text>
                    <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                      {group.privacy === 'open' ? copy.open : copy.closed} · {group.memberCount} {copy.members}
                    </Text>
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
                  <View style={styles.cardSports}>
                    {group.sports.slice(0, 4).map((activitySport) => (
                      <Icon
                        key={activitySport}
                        source={getIconNameByTypeOfSport(activitySport)}
                        size={18}
                        color={colors.primary}
                      />
                    ))}
                  </View>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: { gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  search: { borderRadius: 18 },
  sports: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sportChip: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loader: { flex: 1 },
  feedback: { flex: 1, justifyContent: 'center' },
  list: { gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  groupCard: { borderRadius: 20, gap: 12, padding: 16 },
  cardTop: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  groupIcon: { alignItems: 'center', borderRadius: 16, height: 48, justifyContent: 'center', width: 48 },
  groupTitleBlock: { flex: 1, gap: 4 },
  groupName: { fontWeight: '700' },
  cardBottom: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  cardSports: { flexDirection: 'row', gap: 8 },
  location: { flex: 1, textAlign: 'right' },
});
