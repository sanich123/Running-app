import { ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import ErrorComponent from '@S/error-component/error-component';
import useGroupEventsTab from './use-group-events-tab';
import GroupEventsHeader from '../../../group-events-page/group-events-header/group-events-header';
import GroupEventsList from '../../../group-events-page/group-events-list/group-events-list';
import type { GroupDetails } from '@R/services/groups/types';

export default function GroupEventsTab({ group }: { group: GroupDetails }) {
  const { id, name } = group;
  const {
    canSeeEvents,
    copy,
    error,
    events,
    isError,
    isFetchingNextPage,
    isLoading,
    locale,
    onScroll,
    period,
    refetch,
    setPeriod,
  } = useGroupEventsTab(group);
  const { loadError } = copy;

  return (
    <ScrollView
      contentContainerStyle={styles.listContent}
      onScroll={onScroll}
      scrollEventThrottle={200}
      testID="group-detail-scroll">
      <GroupEventsHeader groupName={name} period={period} onPeriodChange={setPeriod} copy={copy} showTitle={false} />
      {isError ? (
        <ErrorComponent error={error ?? new Error(loadError)} refetch={refetch} />
      ) : (
        <GroupEventsList
          groupId={id}
          period={period}
          canSeeEvents={canSeeEvents}
          copy={copy}
          locale={locale}
          events={events}
          isLoading={isLoading}
        />
      )}
      {isFetchingNextPage ? <ActivityIndicator style={styles.nextPageLoader} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listContent: { flexGrow: 1, gap: 10, paddingBottom: 24 },
  nextPageLoader: { marginVertical: 12 },
});
