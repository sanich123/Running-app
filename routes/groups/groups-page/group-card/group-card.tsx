import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, Surface, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import { GROUP_CATEGORY_LABELS, GROUPS_COPY, getGroupMemberCountLabel, getGroupSportLabels } from '../../const';
import GroupPhoto from '../../group-photo/group-photo';
import type { GroupSummary } from '@R/services/groups/types';

export default function GroupCard({
  group: {
    id,
    name,
    description,
    sports,
    categoryTags,
    photoUrl,
    photoPreviewUrl,
    photoBlurhash,
    photoReviewStatus,
    photoPending,
    isOwner,
    privacy,
    locationName,
    memberCount,
    currentMembership,
  },
}: {
  group: GroupSummary;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const { open, closed, pending } = GROUPS_COPY[language];
  const categoryLabels = GROUP_CATEGORY_LABELS[language === LANGUAGES.english ? 'en' : 'ru'];
  const sportLabels = getGroupSportLabels(language);
  const memberCountLabel = getGroupMemberCountLabel(language, memberCount);
  return (
    <Surface style={[styles.groupCard, { backgroundColor: colors.surface }]} elevation={1}>
      <View style={styles.cardTop}>
        <GroupPhoto
          photoUrl={photoUrl}
          photoPreviewUrl={photoPreviewUrl}
          photoBlurhash={photoBlurhash}
          photoReviewStatus={photoReviewStatus}
          photoPending={photoPending}
          isOwner={isOwner}
          style={[styles.groupPhoto, { backgroundColor: colors.primaryContainer }]}
          testID={`group-photo-${id}`}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/groups/${id}` as never)}
          style={styles.groupTitleBlock}>
          <Text variant="titleMedium" numberOfLines={2} style={styles.groupName}>
            {name}
          </Text>
          <View
            accessible
            accessibilityLabel={`${privacy === 'open' ? open : closed} · ${sports
              .map((sport) => sportLabels[sport])
              .join(', ')} · ${memberCountLabel}`}
            style={styles.groupMeta}>
            <Icon source={privacy === 'open' ? 'earth' : 'lock-outline'} size={16} color={colors.onSurfaceVariant} />
            {sports.slice(0, 4).map((sport) => (
              <Icon key={sport} source={getIconNameByTypeOfSport(sport)} size={18} color={colors.primary} />
            ))}
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {memberCountLabel}
            </Text>
          </View>
        </Pressable>
        {privacy === 'closed' && currentMembership?.status === 'pending' ? (
          <View accessible accessibilityLabel={pending}>
            <Icon source="clock-outline" size={22} color={colors.primary} />
          </View>
        ) : null}
      </View>
      {description || categoryTags.length || locationName ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/groups/${id}` as never)}
          style={styles.groupDetails}>
          {description ? (
            <Text variant="bodyMedium" numberOfLines={2} style={{ color: colors.onSurfaceVariant }}>
              {description}
            </Text>
          ) : null}
          {categoryTags.length ? (
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {categoryTags
                .slice(0, 3)
                .map((tag) => categoryLabels[tag])
                .join(' · ')}
            </Text>
          ) : null}
          {locationName ? (
            <View style={styles.cardBottom}>
              <Text variant="bodySmall" numberOfLines={1} style={[styles.location, { color: colors.onSurfaceVariant }]}>
                {locationName}
              </Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  groupCard: { borderRadius: 16, gap: 7, padding: 12 },
  cardTop: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  groupPhoto: { borderRadius: 14, height: 48, width: 48 },
  groupTitleBlock: { flex: 1, gap: 4 },
  groupDetails: { gap: 7 },
  groupMeta: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  groupName: { fontWeight: '700' },
  cardBottom: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  location: { flex: 1, textAlign: 'right' },
});
