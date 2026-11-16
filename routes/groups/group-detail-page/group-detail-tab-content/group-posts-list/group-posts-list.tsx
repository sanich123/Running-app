import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import ErrorComponent from '@S/error-component/error-component';
import GroupPostCard from '../group-post-card/group-post-card';
import useGroupPostsList from './use-group-posts-list';
import type { GroupDetails } from '@R/services/groups/types';

export default function GroupPostsList({ group }: { group: GroupDetails }) {
  const { canSeePosts, copy, error, isError, isFetching, isFetchingNextPage, isLoading, onScroll, posts, refetch } =
    useGroupPostsList(group);
  const { postsLoadError, noPosts } = copy;

  return canSeePosts ? (
    <ScrollView
      contentContainerStyle={styles.listContent}
      onScroll={onScroll}
      scrollEventThrottle={200}
      testID="group-detail-scroll">
      {isLoading ? (
        <ActivityIndicator />
      ) : isError ? (
        <ErrorComponent error={error ?? new Error(postsLoadError)} refetch={refetch} />
      ) : posts.length ? (
        posts.map(({ id, ...post }) => (
          <GroupPostCard
            key={id}
            post={{ id, ...post }}
            onRefreshStatus={() => void refetch()}
            isRefreshingStatus={isFetching}
          />
        ))
      ) : (
        <Text variant="bodyMedium" style={styles.emptyText}>
          {noPosts}
        </Text>
      )}
      {isFetchingNextPage ? <ActivityIndicator style={styles.nextPageLoader} /> : null}
    </ScrollView>
  ) : (
    <View />
  );
}

const styles = StyleSheet.create({
  listContent: { flexGrow: 1, gap: 12, paddingBottom: 24 },
  emptyText: { alignSelf: 'center', flex: 1, marginTop: 12, textAlign: 'center', textAlignVertical: 'center' },
  nextPageLoader: { marginVertical: 12 },
});
