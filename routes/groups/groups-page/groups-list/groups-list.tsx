import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import EmptyState from '@S/empty-state/empty-state';
import ErrorComponent from '@S/error-component/error-component';
import useGroupsList from './use-groups-list';
import GroupCard from '../group-card/group-card';
import type { GroupsQuery } from '@R/services/groups/types';

export default function GroupsList({ filters }: { filters: GroupsQuery }) {
  const { copy, error, hasFilter, isError, isFetching, isLoading, refetch, visibleGroups } = useGroupsList(filters);
  const { loadError, noResults, emptyTitle, emptyMessage } = copy;
  return isLoading ? (
    <ActivityIndicator style={styles.loader} />
  ) : isError ? (
    <ErrorComponent error={error ?? new Error(loadError)} refetch={refetch} />
  ) : !visibleGroups.length ? (
    <View style={styles.feedback}>
      <EmptyState
        icon="account-group-outline"
        title={hasFilter ? noResults : emptyTitle}
        message={hasFilter ? undefined : emptyMessage}
      />
    </View>
  ) : (
    <FlatList
      data={visibleGroups}
      keyExtractor={({ id }) => id}
      contentContainerStyle={styles.list}
      refreshing={isFetching}
      onRefresh={() => void refetch()}
      renderItem={({ item: group }) => <GroupCard group={group} />}
    />
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1 },
  feedback: { alignSelf: 'center', flex: 1, justifyContent: 'center', maxWidth: MAX_MOBILE_WIDTH, width: '100%' },
  list: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    alignSelf: Platform.OS === 'web' ? 'center' : 'stretch',
    maxWidth: Platform.OS === 'web' ? MAX_MOBILE_WIDTH : undefined,
    width: '100%',
  },
});
