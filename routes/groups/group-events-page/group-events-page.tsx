import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useGetGroupByIdQuery } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import EmptyState from '@S/empty-state/empty-state';
import { GROUPS_COPY } from '../const';
import GroupEventForm from './group-event-form/group-event-form';
import GroupEventsHeader from './group-events-header/group-events-header';
import GroupEventsList from './group-events-list/group-events-list';
import type { GroupEventPeriod } from './types';

export default function GroupEventsPage() {
  const { groupId: rawGroupId } = useLocalSearchParams<{ groupId: string }>();
  const groupId = Array.isArray(rawGroupId) ? rawGroupId[0] : rawGroupId;
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = GROUPS_COPY[language];
  const locale = language === LANGUAGES.russian ? 'ru-RU' : 'en-US';
  const [period, setPeriod] = useState<GroupEventPeriod>('upcoming');
  const { data: group, isLoading, isError, refetch } = useGetGroupByIdQuery(groupId ?? '', { skip: !groupId });
  const canSeeEvents = Boolean(group && (group.privacy === 'open' || group.currentMembership?.status === 'active'));

  return isLoading ? (
    <ActivityIndicator style={styles.loader} />
  ) : isError || !group ? (
    <View style={styles.feedback}>
      <EmptyState icon="calendar-month-outline" title={copy.loadError} />
      <Button onPress={() => refetch()}>{copy.retry}</Button>
    </View>
  ) : (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <GroupEventsHeader groupName={group.name} period={period} onPeriodChange={setPeriod} copy={copy} />
      {group.canManage && period === 'upcoming' && <GroupEventForm groupId={groupId ?? ''} copy={copy} />}
      <GroupEventsList
        groupId={groupId ?? ''}
        period={period}
        canSeeEvents={canSeeEvents}
        copy={copy}
        locale={locale}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1 },
  feedback: { flex: 1, justifyContent: 'center' },
  content: { gap: 16, padding: 16, paddingBottom: 32 },
});
