import { useEffect, useState } from 'react';
import { Image, Pressable, Share, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Badge,
  Chip,
  Dialog,
  Icon,
  IconButton,
  Menu,
  Portal,
  SegmentedButtons,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import {
  useGetGroupByIdQuery,
  useGetGroupMembersInfiniteQuery,
  useGetGroupMonthlyStatisticsInfiniteQuery,
  useGetGroupPostsInfiniteQuery,
  useGetGroupEventsInfiniteQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useUpdateGroupMemberMutation,
  useUpdateGroupPreferencesMutation,
  useDeleteGroupMutation,
} from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import EmptyState from '@S/empty-state/empty-state';
import { errorToast } from '@S/error-toast/error-toast';
import ReportContentDialog from '@S/moderation/report-content-dialog/report-content-dialog';
import { successToast } from '@S/success-toast/success-toast';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import { GROUP_CATEGORY_LABELS, GROUPS_COPY, GROUP_SPORTS, getGroupShareUrl, getGroupSportLabels } from '../const';
import GroupEventsHeader from '../group-events-page/group-events-header/group-events-header';
import GroupEventsList from '../group-events-page/group-events-list/group-events-list';
import GroupMemberRow from '../group-member-row/group-member-row';
import type { GroupEventPeriod } from '../group-events-page/types';

export default function GroupDetailPage() {
  const router = useRouter();
  const { groupId: rawGroupId, tab: rawTab } = useLocalSearchParams<{ groupId: string; tab?: string }>();
  const groupId = Array.isArray(rawGroupId) ? rawGroupId[0] : rawGroupId;
  const requestedTab = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const copy = GROUPS_COPY[language];
  const sportLabels = getGroupSportLabels(language);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [selectedTab, setSelectedTab] = useState<'members' | 'distance' | 'posts' | 'events'>(
    requestedTab === 'events' ? 'events' : 'distance',
  );
  const [eventPeriod, setEventPeriod] = useState<GroupEventPeriod>('upcoming');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [isReportDialogVisible, setIsReportDialogVisible] = useState(false);
  const { data: group, isLoading, isError, refetch } = useGetGroupByIdQuery(groupId ?? '', { skip: !groupId });
  useEffect(() => {
    if (!group?.photoPending) return;
    const interval = setInterval(() => void refetch(), 8000);
    return () => clearInterval(interval);
  }, [group?.photoPending, refetch]);
  const isGroupOwner = Boolean(group && (group.isOwner || (userId && group.createdByUserId === userId)));
  const canManageGroup = Boolean(group?.canManage || isGroupOwner);
  const isActiveMember = Boolean(group?.currentMembership?.status === 'active' || isGroupOwner);
  const canSeeMembers = Boolean(
    group && (group.privacy === 'open' || group.currentMembership?.status === 'active' || isGroupOwner),
  );
  const membersQuery = useGetGroupMembersInfiniteQuery(
    { groupId: groupId ?? '', status: 'active' },
    { skip: !groupId || !canSeeMembers || selectedTab !== 'members' },
  );
  const members = membersQuery.data?.pages.flatMap(({ items }) => items) ?? [];
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const monthlyStatisticsQuery = useGetGroupMonthlyStatisticsInfiniteQuery(
    {
      groupId: groupId ?? '',
      year: selectedMonth.getFullYear(),
      month: selectedMonth.getMonth(),
      timeZone,
    },
    { skip: !groupId || !canSeeMembers || selectedTab !== 'distance' },
  );
  const monthlyStatistics = monthlyStatisticsQuery.data?.pages.flatMap(({ items }) => items) ?? [];
  const postsQuery = useGetGroupPostsInfiniteQuery(groupId ?? '', {
    skip: !groupId || !canSeeMembers || selectedTab !== 'posts',
  });
  const posts = postsQuery.data?.pages.flatMap(({ items }) => items) ?? [];
  const eventsQuery = useGetGroupEventsInfiniteQuery(
    { groupId: groupId ?? '', period: eventPeriod },
    { skip: !groupId || !canSeeMembers || selectedTab !== 'events' },
  );
  const events = eventsQuery.data?.pages.flatMap(({ items }) => items) ?? [];
  const isFetchingNextPage =
    (selectedTab === 'members' && membersQuery.isFetchingNextPage) ||
    (selectedTab === 'distance' && monthlyStatisticsQuery.isFetchingNextPage) ||
    (selectedTab === 'posts' && postsQuery.isFetchingNextPage) ||
    (selectedTab === 'events' && eventsQuery.isFetchingNextPage);
  const loadNextPage = () => {
    if (selectedTab === 'members' && membersQuery.hasNextPage && !membersQuery.isFetchingNextPage) {
      void membersQuery.fetchNextPage();
    } else if (
      selectedTab === 'distance' &&
      monthlyStatisticsQuery.hasNextPage &&
      !monthlyStatisticsQuery.isFetchingNextPage
    ) {
      void monthlyStatisticsQuery.fetchNextPage();
    } else if (selectedTab === 'posts' && postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
      void postsQuery.fetchNextPage();
    } else if (selectedTab === 'events' && eventsQuery.hasNextPage && !eventsQuery.isFetchingNextPage) {
      void eventsQuery.fetchNextPage();
    }
  };
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    if (contentSize.height - (contentOffset.y + layoutMeasurement.height) < 400) loadNextPage();
  };
  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();
  const [updateMember, { isLoading: isUpdatingMember }] = useUpdateGroupMemberMutation();
  const [updatePreferences, { isLoading: isUpdatingPreferences }] = useUpdateGroupPreferencesMutation();
  const [deleteGroup, { isLoading: isDeletingGroup }] = useDeleteGroupMutation();

  const changeMember = async (userId: string, status: 'active' | 'rejected' | 'removed') => {
    if (!groupId) return;
    try {
      await updateMember({ groupId, userId, status }).unwrap();
    } catch (error) {
      errorToast(copy.saveError, error);
    }
  };

  if (isLoading) return <ActivityIndicator style={styles.loader} />;
  if (isError || !group) {
    return (
      <View style={styles.errorState}>
        <EmptyState icon="account-group-outline" title={copy.loadError} />
        <Button onPress={() => refetch()}>{copy.retry}</Button>
      </View>
    );
  }

  const shareGroup = async () => {
    try {
      const url = getGroupShareUrl(group.id);
      await Share.share({ title: group.name, message: `${group.name}\n${url}`, url });
    } catch (error) {
      errorToast(copy.saveError, error);
    }
  };

  const deleteCurrentGroup = async () => {
    try {
      await deleteGroup(group.id).unwrap();
      setIsDeleteDialogVisible(false);
      successToast(copy.groupDeleted);
      router.replace('/groups' as never);
    } catch (error) {
      errorToast(copy.deleteGroupError, error);
    }
  };

  const isOwner = isGroupOwner;
  const openContentComposer = () => router.push(`/groups/${group.id}/create-content` as never);
  const isPending = group.currentMembership?.status === 'pending';
  const monthLabel = new Intl.DateTimeFormat(language === LANGUAGES.russian ? 'ru-RU' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(selectedMonth);
  const now = new Date();
  const canGoToNextMonth =
    selectedMonth.getFullYear() < now.getFullYear() ||
    (selectedMonth.getFullYear() === now.getFullYear() && selectedMonth.getMonth() < now.getMonth());
  const membership = group.currentMembership;
  const locale = language === LANGUAGES.russian ? 'ru-RU' : 'en-US';
  const categoryLabels = GROUP_CATEGORY_LABELS[language === LANGUAGES.english ? 'en' : 'ru'];

  const changePreferences = async (preference: 'notificationPreference' | 'feedPreference', value: string) => {
    if (!groupId || !membership) return;
    try {
      await updatePreferences({
        groupId,
        notificationPreference:
          preference === 'notificationPreference'
            ? (value as 'all' | 'announcements' | 'off')
            : (membership.notificationPreference ?? 'all'),
        feedPreference:
          preference === 'feedPreference' ? (value as 'all' | 'admins') : (membership.feedPreference ?? 'all'),
      }).unwrap();
    } catch (error) {
      errorToast(copy.saveError, error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerActions}>
              {canManageGroup && (
                <View>
                  <IconButton
                    icon="account-clock-outline"
                    accessibilityLabel={copy.manageRequests}
                    onPress={() => router.push(`/groups/${group.id}/requests` as never)}
                    testID="group-requests-header-button"
                  />
                  {group.pendingRequestCount > 0 && (
                    <Badge style={styles.requestBadge}>
                      {group.pendingRequestCount > 99 ? '99+' : group.pendingRequestCount}
                    </Badge>
                  )}
                </View>
              )}
              {isActiveMember && (
                <IconButton
                  icon="plus"
                  accessibilityLabel={copy.createContent}
                  testID="group-create-content-header-button"
                  onPress={openContentComposer}
                />
              )}
              <Menu
                visible={isMenuVisible}
                onDismiss={() => setIsMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    accessibilityLabel={copy.groupActions}
                    onPress={() => setIsMenuVisible(true)}
                  />
                }>
                <Menu.Item
                  leadingIcon="share-variant"
                  onPress={() => {
                    setIsMenuVisible(false);
                    void shareGroup();
                  }}
                  title={copy.share}
                />
                {isOwner ? (
                  <>
                    <Menu.Item
                      leadingIcon="pencil-outline"
                      onPress={() => {
                        setIsMenuVisible(false);
                        router.push(`/groups/${group.id}/edit` as never);
                      }}
                      title={copy.editGroup}
                    />
                    <Menu.Item
                      leadingIcon="delete-outline"
                      onPress={() => {
                        setIsMenuVisible(false);
                        setIsDeleteDialogVisible(true);
                      }}
                      title={copy.deleteGroup}
                    />
                  </>
                ) : (
                  <Menu.Item
                    leadingIcon="flag-outline"
                    onPress={() => {
                      setIsMenuVisible(false);
                      setIsReportDialogVisible(true);
                    }}
                    title={copy.reportGroup}
                  />
                )}
              </Menu>
            </View>
          ),
        }}
      />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={200}
        testID="group-detail-scroll">
        <Surface style={[styles.hero, { backgroundColor: colors.surface }]} elevation={1}>
          <View style={styles.heroTop}>
            {group.photoUrl || group.photoPreviewUrl ? (
              <Image
                source={{ uri: group.photoUrl ?? group.photoPreviewUrl ?? undefined }}
                style={styles.groupPhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.heroIcon, { backgroundColor: colors.primaryContainer }]}>
                <Icon source="account-group" size={28} color={colors.primary} />
              </View>
            )}
            <View style={styles.heroSummary}>
              <Text variant="titleLarge" numberOfLines={2} style={styles.title}>
                {group.name}
              </Text>
              <View
                accessible
                accessibilityLabel={`${group.privacy === 'open' ? copy.open : copy.closed} · ${group.sports
                  .map((sport) => sportLabels[sport])
                  .join(', ')} · ${group.memberCount} ${copy.members}`}
                style={styles.metaLine}>
                <Icon
                  source={group.privacy === 'open' ? 'earth' : 'lock-outline'}
                  size={16}
                  color={colors.onSurfaceVariant}
                />
                {GROUP_SPORTS.filter((sport) => group.sports.includes(sport)).map((sport) => (
                  <Icon key={sport} source={getIconNameByTypeOfSport(sport)} size={18} color={colors.primary} />
                ))}
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  {group.memberCount} {copy.members}
                </Text>
              </View>
              {!!group.locationName && (
                <View style={styles.metaLine}>
                  <Icon source="map-marker-outline" size={16} color={colors.onSurfaceVariant} />
                  <Text variant="bodySmall" numberOfLines={1}>
                    {group.locationName}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {!!group.description && (
            <Text variant="bodyMedium" numberOfLines={3} style={styles.description}>
              {group.description}
            </Text>
          )}
          <View style={styles.sports}>
            {GROUP_SPORTS.filter((sport) => group.sports.includes(sport)).map((sport) => (
              <Chip key={sport} compact>
                {sportLabels[sport]}
              </Chip>
            ))}
          </View>
          {!!group.categoryTags?.length && (
            <View style={styles.sports}>
              {group.categoryTags.map((tag) => (
                <Chip key={tag} compact>
                  {categoryLabels[tag]}
                </Chip>
              ))}
            </View>
          )}
          {!canManageGroup && !isActiveMember && (
            <Button
              mode="contained"
              onPress={async () => {
                if (!groupId) return;
                try {
                  await joinGroup(groupId).unwrap();
                  if (group.privacy === 'closed') successToast(copy.requestSent);
                } catch (error) {
                  errorToast(copy.saveError, error);
                }
              }}
              loading={isJoining}
              disabled={isJoining || isPending}
              style={styles.joinButton}>
              {isPending ? copy.pending : group.privacy === 'open' ? copy.join : copy.request}
            </Button>
          )}
          {isActiveMember && !isOwner && (
            <Button
              mode="outlined"
              onPress={async () => {
                if (!groupId) return;
                try {
                  await leaveGroup(groupId).unwrap();
                  router.back();
                } catch (error) {
                  errorToast(copy.saveError, error);
                }
              }}
              loading={isLeaving}
              disabled={isLeaving}
              style={styles.joinButton}>
              {copy.leave}
            </Button>
          )}
        </Surface>

        <SegmentedButtons
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as 'members' | 'distance' | 'posts' | 'events')}
          buttons={[
            {
              value: 'members',
              icon: 'account-group-outline',
              accessibilityLabel: copy.membersTab,
              showSelectedCheck: false,
            },
            {
              value: 'distance',
              icon: 'map-marker-distance',
              accessibilityLabel: copy.distanceTab,
              showSelectedCheck: false,
            },
            {
              value: 'posts',
              icon: 'text-box-outline',
              accessibilityLabel: copy.postsTab,
              showSelectedCheck: false,
            },
            {
              value: 'events',
              icon: 'calendar-month-outline',
              accessibilityLabel: copy.events,
              showSelectedCheck: false,
            },
          ]}
        />

        {canSeeMembers && selectedTab === 'posts' && (
          <View style={styles.section}>
            {postsQuery.isLoading ? (
              <ActivityIndicator />
            ) : postsQuery.isError ? (
              <Text variant="bodyMedium" style={{ color: colors.error }}>
                {copy.loadError}
              </Text>
            ) : posts.length ? (
              posts.map((post) => {
                const postPhotoUrl = post.photoUrl ?? post.photoPreviewUrl;
                return (
                  <Surface key={post.id} style={[styles.post, { backgroundColor: colors.surface }]} elevation={1}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={post.author?.name || copy.member}
                      disabled={!post.author?.userId}
                      onPress={() => {
                        if (post.author?.userId) router.push(`/profile/${post.author.userId}` as never);
                      }}
                      style={styles.postHeader}
                      testID={`group-post-author-${post.id}`}>
                      {post.author?.profilePhoto ? (
                        <Avatar.Image size={40} source={{ uri: post.author.profilePhoto }} />
                      ) : (
                        <Avatar.Icon size={40} icon="account" />
                      )}
                      <View style={styles.postAuthor}>
                        <Text variant="titleSmall">{post.author?.name || copy.member}</Text>
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                          {new Date(post.createdAt).toLocaleString(locale)}
                        </Text>
                      </View>
                    </Pressable>
                    <Text variant="bodyLarge">{post.text}</Text>
                    {postPhotoUrl && (
                      <Image source={{ uri: postPhotoUrl }} style={styles.postPhoto} resizeMode="cover" />
                    )}
                    {post.hasPhoto && (post.photoPending || !postPhotoUrl) && (
                      <View style={styles.postPhotoNotice}>
                        <Icon
                          source={post.photoPending ? 'clock-outline' : 'image-off-outline'}
                          size={16}
                          color={colors.onSurfaceVariant}
                        />
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                          {post.photoPending ? copy.postPhotoPending : copy.postPhotoUnavailable}
                        </Text>
                      </View>
                    )}
                  </Surface>
                );
              })
            ) : (
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {copy.noPosts}
              </Text>
            )}
          </View>
        )}

        {selectedTab === 'events' && (
          <View style={styles.section}>
            <GroupEventsHeader
              groupName={group.name}
              period={eventPeriod}
              onPeriodChange={setEventPeriod}
              copy={copy}
              showTitle={false}
            />
            <GroupEventsList
              groupId={group.id}
              period={eventPeriod}
              canSeeEvents={canSeeMembers}
              copy={copy}
              locale={locale}
              events={events}
              isLoading={eventsQuery.isLoading}
            />
          </View>
        )}

        {canSeeMembers && selectedTab === 'distance' && (
          <View style={styles.section}>
            <View style={styles.monthControls}>
              <IconButton
                icon="chevron-left"
                accessibilityLabel={copy.previousMonth}
                onPress={() => setSelectedMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              />
              <Text variant="bodyMedium" style={styles.monthLabel}>
                {monthLabel}
              </Text>
              <IconButton
                icon="chevron-right"
                accessibilityLabel={copy.nextMonth}
                disabled={!canGoToNextMonth}
                onPress={() => setSelectedMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              />
            </View>
            {monthlyStatisticsQuery.isLoading ? (
              <ActivityIndicator />
            ) : monthlyStatisticsQuery.isError ? (
              <View>
                <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                  {copy.statsError}
                </Text>
                <Button onPress={() => void monthlyStatisticsQuery.refetch()}>{copy.retry}</Button>
              </View>
            ) : monthlyStatistics.length ? (
              monthlyStatistics.map((memberStatistics, index) => (
                <GroupMemberRow
                  key={memberStatistics.userId}
                  member={{
                    userId: memberStatistics.userId,
                    role: 'member',
                    status: 'active',
                    joinedAt: null,
                    profile: memberStatistics.profile,
                  }}
                  canManage={false}
                  isUpdating={false}
                  onUpdateMember={changeMember}
                  copy={copy}
                  language={language}
                  rank={index + 1}
                  distanceLabel={`${(memberStatistics.totalDistance / 1000).toLocaleString(locale, { maximumFractionDigits: 1 })} ${copy.distanceUnit}`}
                  onPressProfile={() => router.push(`/profile/${memberStatistics.userId}` as never)}
                />
              ))
            ) : (
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {copy.noMonthlyStats}
              </Text>
            )}
          </View>
        )}

        {selectedTab === 'members' && isActiveMember && membership && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              {copy.notifications}
            </Text>
            <SegmentedButtons
              value={membership.notificationPreference ?? 'all'}
              onValueChange={(value) => void changePreferences('notificationPreference', value)}
              buttons={[
                { value: 'all', label: copy.allNotifications, disabled: isUpdatingPreferences },
                { value: 'announcements', label: copy.announcementNotifications, disabled: isUpdatingPreferences },
                { value: 'off', label: copy.notificationsOff, disabled: isUpdatingPreferences },
              ]}
            />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {copy.feedPreference}
            </Text>
            <SegmentedButtons
              value={membership.feedPreference ?? 'all'}
              onValueChange={(value) => void changePreferences('feedPreference', value)}
              buttons={[
                { value: 'all', label: copy.allGroupPosts, disabled: isUpdatingPreferences },
                { value: 'admins', label: copy.adminPostsOnly, disabled: isUpdatingPreferences },
              ]}
            />
          </View>
        )}

        {selectedTab === 'members' && canSeeMembers && (
          <View style={styles.section}>
            {membersQuery.isLoading ? (
              <ActivityIndicator />
            ) : members.length ? (
              members.map((member) => (
                <GroupMemberRow
                  key={member.userId}
                  member={member}
                  canManage={canManageGroup}
                  isUpdating={isUpdatingMember}
                  onUpdateMember={changeMember}
                  copy={copy}
                  language={language}
                  onPressProfile={() => router.push(`/profile/${member.userId}` as never)}
                />
              ))
            ) : (
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {copy.noMembers}
              </Text>
            )}
          </View>
        )}
        {isFetchingNextPage && <ActivityIndicator style={styles.nextPageLoader} />}
      </ScrollView>
      <Portal>
        <Dialog visible={isDeleteDialogVisible} onDismiss={() => setIsDeleteDialogVisible(false)}>
          <Dialog.Title>{copy.deleteGroupTitle}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{copy.deleteGroupMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDeleteDialogVisible(false)} disabled={isDeletingGroup}>
              {copy.deleteGroupCancel}
            </Button>
            <Button onPress={() => void deleteCurrentGroup()} loading={isDeletingGroup} disabled={isDeletingGroup}>
              {copy.deleteGroupConfirm}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <ReportContentDialog
        visible={isReportDialogVisible}
        targetType="group"
        targetId={group.id}
        onDismiss={() => setIsReportDialogVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1 },
  errorState: { flex: 1, justifyContent: 'center' },
  content: { gap: 12, padding: 12, paddingBottom: 24 },
  headerActions: { alignItems: 'center', flexDirection: 'row' },
  requestBadge: { position: 'absolute', right: 2, top: 2 },
  hero: { borderRadius: 18, gap: 8, padding: 12 },
  heroTop: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  heroSummary: { flex: 1, gap: 4, minWidth: 0 },
  groupPhoto: { borderRadius: 14, height: 64, width: 64 },
  heroIcon: { alignItems: 'center', borderRadius: 18, height: 64, justifyContent: 'center', width: 64 },
  title: { fontWeight: '800', lineHeight: 28 },
  metaLine: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  description: { lineHeight: 20 },
  sports: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  joinButton: { alignSelf: 'stretch', marginTop: 0 },
  section: { gap: 10 },
  sectionTitle: { fontWeight: '700', marginBottom: 2 },
  monthControls: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  monthLabel: { minWidth: 140, textAlign: 'center', textTransform: 'capitalize' },
  post: { borderRadius: 16, gap: 12, padding: 14 },
  postHeader: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  postAuthor: { flex: 1, gap: 2 },
  postPhoto: { aspectRatio: 1.4, borderRadius: 12, width: '100%' },
  postPhotoNotice: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  nextPageLoader: { marginVertical: 12 },
});
