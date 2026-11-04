import { StyleSheet, View } from 'react-native';
import { Button, Chip, Icon, Surface, Text } from 'react-native-paper';
import useGroupInfoCard from './use-group-info-card';
import GroupPhoto from '../../group-photo/group-photo';
import type { GroupDetails } from '@R/services/groups/types';

export default function GroupInfoCard({
  group,
  isRefreshing = false,
}: {
  group: GroupDetails;
  isRefreshing?: boolean;
}) {
  const {
    name,
    description,
    sports: groupSports,
    categoryTags: groupCategoryTags,
    photoUrl,
    photoPreviewUrl,
    photoBlurhash,
    photoReviewStatus,
    photoPending,
    privacy,
    locationName,
  } = group;
  const categoryTags = groupCategoryTags ?? [];
  const {
    categoryLabels,
    colors,
    copy,
    isActiveMember,
    isJoining,
    isLeaving,
    memberCountLabel,
    isOwner,
    isPending,
    onJoin,
    onLeave,
    sportLabels,
    sports,
  } = useGroupInfoCard(group, isRefreshing);
  const { open, closed, pending, join, request, leave } = copy;

  return (
    <Surface style={[styles.hero, { backgroundColor: colors.surface }]} elevation={1}>
      <View style={styles.heroTop}>
        <GroupPhoto
          photoUrl={photoUrl}
          photoPreviewUrl={photoPreviewUrl}
          photoBlurhash={photoBlurhash}
          photoReviewStatus={photoReviewStatus}
          photoPending={photoPending}
          isOwner={isOwner}
          style={[styles.groupPhoto, { backgroundColor: colors.primaryContainer }]}
          iconSize={28}
          testID="group-detail-photo"
        />
        <View style={styles.heroSummary}>
          <Text variant="titleLarge" numberOfLines={2} style={styles.title}>
            {name}
          </Text>
          <View
            accessible
            accessibilityLabel={`${privacy === 'open' ? open : closed} · ${groupSports
              .map((sport) => sportLabels[sport])
              .join(', ')} · ${memberCountLabel}`}
            style={styles.metaLine}>
            <Icon source={privacy === 'open' ? 'earth' : 'lock-outline'} size={16} color={colors.onSurfaceVariant} />
            {sports.map(({ icon, sport }) => (
              <Icon key={sport} source={icon} size={18} color={colors.primary} />
            ))}
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {memberCountLabel}
            </Text>
          </View>
          {locationName ? (
            <View style={styles.metaLine}>
              <Icon source="map-marker-outline" size={16} color={colors.onSurfaceVariant} />
              <Text variant="bodySmall" numberOfLines={1}>
                {locationName}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {description ? (
        <Text variant="bodyMedium" numberOfLines={3} style={styles.description}>
          {description}
        </Text>
      ) : null}
      {categoryTags.length ? (
        <View style={styles.sports}>
          {categoryTags.map((tag) => (
            <Chip key={tag} compact>
              {categoryLabels[tag]}
            </Chip>
          ))}
        </View>
      ) : null}
      {!isOwner && !isActiveMember ? (
        <Button
          mode="contained"
          onPress={onJoin}
          loading={isJoining}
          disabled={isJoining || isPending}
          style={styles.joinButton}>
          {isPending ? pending : privacy === 'open' ? join : request}
        </Button>
      ) : null}
      {isActiveMember && !isOwner ? (
        <Button mode="outlined" onPress={onLeave} loading={isLeaving} disabled={isLeaving} style={styles.joinButton}>
          {leave}
        </Button>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 18, gap: 8, padding: 12 },
  heroTop: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  heroSummary: { flex: 1, gap: 4, minWidth: 0 },
  groupPhoto: { borderRadius: 14, height: 64, width: 64 },
  title: { fontWeight: '800', lineHeight: 28 },
  metaLine: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  description: { lineHeight: 20 },
  sports: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  joinButton: { alignSelf: 'stretch', marginTop: 0 },
});
