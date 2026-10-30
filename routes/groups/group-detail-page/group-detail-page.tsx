import { useState } from 'react';
import { Image, Share, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Chip,
  Icon,
  IconButton,
  SegmentedButtons,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { LANGUAGES } from '@const/enums';
import {
  useGetGroupByIdQuery,
  useGetGroupMembersQuery,
  useGetGroupMonthlyStatisticsQuery,
  useGetGroupPostsQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useUpdateGroupMemberMutation,
  useUpdateGroupPreferencesMutation,
  useCreateGroupPostMutation,
} from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import CustomTextInput from '@S/custom-text-input/custom-text-input';
import EmptyState from '@S/empty-state/empty-state';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import { GROUP_CATEGORY_LABELS, GROUPS_COPY, GROUP_SPORTS, getGroupShareUrl, getGroupSportLabels } from '../const';
import GroupMemberRow from '../group-member-row/group-member-row';

export default function GroupDetailPage() {
  const router = useRouter();
  const { groupId: rawGroupId } = useLocalSearchParams<{ groupId: string }>();
  const groupId = Array.isArray(rawGroupId) ? rawGroupId[0] : rawGroupId;
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = GROUPS_COPY[language];
  const sportLabels = getGroupSportLabels(language);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const {
    control: postControl,
    watch: watchPost,
    setValue: setPostValue,
  } = useForm<{ postText: string }>({
    defaultValues: { postText: '' },
  });
  const postText = watchPost('postText');
  const { data: group, isLoading, isError, refetch } = useGetGroupByIdQuery(groupId ?? '', { skip: !groupId });
  const canSeeMembers = Boolean(group && (group.privacy === 'open' || group.currentMembership?.status === 'active'));
  const { data: members = [] } = useGetGroupMembersQuery(
    { groupId: groupId ?? '', status: 'active' },
    { skip: !groupId || !canSeeMembers },
  );
  const { data: requests = [] } = useGetGroupMembersQuery(
    { groupId: groupId ?? '', status: 'pending' },
    { skip: !groupId || !group?.canManage },
  );
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const {
    data: monthlyStatistics,
    isLoading: isLoadingMonthlyStatistics,
    isError: isMonthlyStatisticsError,
    refetch: refetchMonthlyStatistics,
  } = useGetGroupMonthlyStatisticsQuery(
    {
      groupId: groupId ?? '',
      year: selectedMonth.getFullYear(),
      month: selectedMonth.getMonth(),
      timeZone,
    },
    { skip: !groupId || !canSeeMembers },
  );
  const { data: posts = [], isError: isPostsError } = useGetGroupPostsQuery(groupId ?? '', {
    skip: !groupId || !canSeeMembers,
  });
  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();
  const [updateMember, { isLoading: isUpdatingMember }] = useUpdateGroupMemberMutation();
  const [updatePreferences, { isLoading: isUpdatingPreferences }] = useUpdateGroupPreferencesMutation();
  const [createPost, { isLoading: isPublishingPost }] = useCreateGroupPostMutation();

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

  const isActiveMember = group.currentMembership?.status === 'active';
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
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Surface style={[styles.hero, { backgroundColor: colors.surface }]} elevation={1}>
        {group.photoUrl ? (
          <Avatar.Image size={76} source={{ uri: group.photoUrl }} />
        ) : (
          <View style={[styles.heroIcon, { backgroundColor: colors.primaryContainer }]}>
            <Icon source="account-group" size={34} color={colors.primary} />
          </View>
        )}
        <Text variant="headlineSmall" style={styles.title}>
          {group.name}
        </Text>
        <View style={styles.metaLine}>
          <Icon
            source={group.privacy === 'open' ? 'earth' : 'lock-outline'}
            size={18}
            color={colors.onSurfaceVariant}
          />
          <Text variant="bodyMedium">{group.privacy === 'open' ? copy.open : copy.closed}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            · {group.memberCount} {copy.members}
          </Text>
        </View>
        {!!group.locationName && (
          <View style={styles.metaLine}>
            <Icon source="map-marker-outline" size={18} color={colors.onSurfaceVariant} />
            <Text variant="bodyMedium">{group.locationName}</Text>
          </View>
        )}
        {!!group.description && (
          <Text variant="bodyLarge" style={styles.description}>
            {group.description}
          </Text>
        )}
        <View style={styles.sports}>
          {GROUP_SPORTS.filter((sport) => group.sports.includes(sport)).map((sport) => (
            <Chip key={sport} compact icon={getIconNameByTypeOfSport(sport)}>
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
        <Button
          mode="outlined"
          icon="share-variant"
          onPress={async () => {
            try {
              const url = getGroupShareUrl(group.id);
              await Share.share({ title: group.name, message: `${group.name}\n${url}`, url });
            } catch (error) {
              errorToast(copy.saveError, error);
            }
          }}>
          {copy.share}
        </Button>
        {!group.canManage && !isActiveMember && (
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
        {isActiveMember && group.currentMembership?.role !== 'owner' && (
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

      {canSeeMembers && (
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {copy.posts}
          </Text>
          {isActiveMember && (
            <>
              <CustomTextInput<{ postText: string }>
                control={postControl}
                fieldName="postText"
                multiline
                maxLength={2000}
                placeholder={copy.postPlaceholder}
                testID="group-post-input"
                validation={{ required: '' }}
              />
              <Button
                mode="contained"
                testID="group-post-submit"
                disabled={!postText.trim() || isPublishingPost}
                loading={isPublishingPost}
                onPress={async () => {
                  if (!groupId || !postText.trim()) return;
                  try {
                    await createPost({ groupId, text: postText.trim() }).unwrap();
                    setPostValue('postText', '');
                  } catch (error) {
                    errorToast(copy.postError, error);
                  }
                }}>
                {copy.publishPost}
              </Button>
            </>
          )}
          {isPostsError ? (
            <Text variant="bodyMedium" style={{ color: colors.error }}>
              {copy.loadError}
            </Text>
          ) : posts.length ? (
            posts.map((post) => (
              <Surface key={post.id} style={[styles.post, { backgroundColor: colors.surface }]} elevation={1}>
                <View style={styles.postHeader}>
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
                </View>
                <Text variant="bodyLarge">{post.text}</Text>
                {post.photoUrl && <Image source={{ uri: post.photoUrl }} style={styles.postPhoto} resizeMode="cover" />}
              </Surface>
            ))
          ) : (
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {copy.noPosts}
            </Text>
          )}
          <Button
            mode="outlined"
            icon="calendar-month-outline"
            onPress={() => router.push(`/groups/${group.id}/events` as never)}>
            {copy.events}
          </Button>
        </View>
      )}

      {canSeeMembers && (
        <View style={styles.section}>
          <View style={styles.monthHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              {copy.monthlyStats}
            </Text>
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
          </View>
          {isLoadingMonthlyStatistics ? (
            <ActivityIndicator />
          ) : isMonthlyStatisticsError ? (
            <View>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {copy.statsError}
              </Text>
              <Button onPress={() => refetchMonthlyStatistics()}>{copy.retry}</Button>
            </View>
          ) : monthlyStatistics?.items.length ? (
            monthlyStatistics.items.map((memberStatistics, index) => (
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
              />
            ))
          ) : (
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {copy.noMonthlyStats}
            </Text>
          )}
        </View>
      )}

      {isActiveMember && membership && (
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

      {group.canManage && (
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {copy.requestsTitle}
          </Text>
          {requests.length ? (
            requests.map((member) => (
              <GroupMemberRow
                key={member.userId}
                member={member}
                isRequest
                canManage={group.canManage}
                isUpdating={isUpdatingMember}
                onUpdateMember={changeMember}
                copy={copy}
                language={language}
              />
            ))
          ) : (
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {copy.noNewRequests}
            </Text>
          )}
        </View>
      )}

      {canSeeMembers && (
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {copy.membersTitle} · {group.memberCount}
          </Text>
          {members.length ? (
            members.map((member) => (
              <GroupMemberRow
                key={member.userId}
                member={member}
                canManage={group.canManage}
                isUpdating={isUpdatingMember}
                onUpdateMember={changeMember}
                copy={copy}
                language={language}
              />
            ))
          ) : (
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {copy.noMembers}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1 },
  errorState: { flex: 1, justifyContent: 'center' },
  content: { gap: 20, padding: 16, paddingBottom: 32 },
  hero: { alignItems: 'flex-start', borderRadius: 24, gap: 12, padding: 20 },
  heroIcon: { alignItems: 'center', borderRadius: 22, height: 64, justifyContent: 'center', width: 64 },
  title: { fontWeight: '800' },
  metaLine: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  description: { lineHeight: 24 },
  sports: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  joinButton: { alignSelf: 'stretch', marginTop: 4 },
  section: { gap: 10 },
  sectionTitle: { fontWeight: '700', marginBottom: 2 },
  monthHeader: { gap: 4 },
  monthControls: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  monthLabel: { minWidth: 140, textAlign: 'center', textTransform: 'capitalize' },
  post: { borderRadius: 16, gap: 12, padding: 14 },
  postHeader: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  postAuthor: { flex: 1, gap: 2 },
  postPhoto: { aspectRatio: 1.4, borderRadius: 12, width: '100%' },
});
