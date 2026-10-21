import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { PROFILE_PREVIEW_PHOTO, PROFILE_PRIVACY_SETTINGS } from '../../const';
import type { ProfilePrivacyPreviewProps } from './types';

export default function ProfilePrivacyPreview({
  profileSearchVisible,
  allowNewFollowers,
  hideActivityStatistics,
  hideFollowingList,
  hideProfilePhotos,
  language,
}: ProfilePrivacyPreviewProps) {
  const { colors } = useTheme();
  const copy = PROFILE_PRIVACY_SETTINGS[language];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}>
      <View style={styles.heading}>
        <Text variant="titleSmall">{copy.profilePreviewTitle}</Text>
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          {copy.profilePreviewHint}
        </Text>
      </View>

      <View
        testID="privacy-profile-preview-photos"
        style={[styles.photoStrip, hideProfilePhotos && styles.inactiveBlock]}>
        <View style={[styles.photo, styles.photoOne]} />
        <View style={[styles.photo, styles.photoTwo]} />
        <View style={[styles.photo, styles.photoThree]} />
        {hideProfilePhotos ? (
          <View style={[styles.hiddenOverlay, { backgroundColor: colors.surface + 'E8' }]}>
            <Icon source="image-off-outline" size={19} color={colors.onSurfaceVariant} />
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
              {copy.activityPreviewPhotosHidden}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.profileHeader, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
          <Image
            testID="privacy-profile-preview-avatar-photo"
            accessibilityLabel={copy.activityPreviewProfileName}
            source={PROFILE_PREVIEW_PHOTO}
            contentFit="cover"
            style={styles.avatarPhoto}
          />
        </View>
        <View style={styles.profileIdentity}>
          <Text variant="titleSmall" numberOfLines={1}>
            {copy.activityPreviewProfileName}
          </Text>
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            {copy.activityPreviewCity}
          </Text>
        </View>
      </View>
      <View
        testID="privacy-profile-preview-search"
        style={[
          styles.statusRow,
          { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
          !profileSearchVisible && styles.inactiveBlock,
        ]}>
        <Icon source="account-search-outline" size={18} color={colors.primary} />
        <Text variant="bodySmall">{copy.activityPreviewSearchStatus}</Text>
        <Text variant="labelSmall" style={[styles.statusValue, { color: colors.onSurfaceVariant }]}>
          {profileSearchVisible ? copy.activityPreviewProfileSearchEnabled : copy.activityPreviewProfileSearchDisabled}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Text variant="labelLarge" style={{ color: colors.primary }}>
          {copy.activityPreviewAbout}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {copy.activityPreviewBio}
        </Text>
      </View>

      <View
        testID="privacy-profile-preview-follow-lists"
        style={[styles.community, hideFollowingList && styles.inactiveBlock]}>
        {[copy.activityPreviewFollowers, copy.activityPreviewFollowing].map((label) => (
          <View
            key={label}
            style={[styles.communityCell, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
              {label}
            </Text>
            <Text variant="titleSmall">{hideFollowingList ? '—' : '128'}</Text>
          </View>
        ))}
        {hideFollowingList ? (
          <View style={[styles.hiddenOverlay, styles.communityOverlay, { backgroundColor: colors.surface + 'E8' }]}>
            <Icon source="account-multiple-minus-outline" size={18} color={colors.onSurfaceVariant} />
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
              {copy.activityPreviewListsHidden}
            </Text>
          </View>
        ) : null}
      </View>

      <View
        testID="privacy-profile-preview-follow-action"
        style={[
          styles.followButton,
          { backgroundColor: allowNewFollowers ? colors.primary : colors.surfaceVariant },
          !allowNewFollowers && styles.inactiveBlock,
        ]}>
        <Text variant="labelLarge" style={{ color: allowNewFollowers ? colors.onPrimary : colors.onSurfaceVariant }}>
          {allowNewFollowers ? copy.activityPreviewFollow : copy.activityPreviewFollowingDisabled}
        </Text>
      </View>

      <View
        testID="privacy-profile-preview-statistics"
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
          hideActivityStatistics && styles.inactiveBlock,
        ]}>
        <View style={styles.sectionTitle}>
          <Text variant="labelLarge">{copy.activityPreviewStatistics}</Text>
          {hideActivityStatistics ? (
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
              {copy.activityPreviewStatisticsHidden}
            </Text>
          ) : null}
        </View>
        <View style={styles.statisticsRow}>
          {[copy.activityPreviewActivities, copy.activityPreviewTotalDistance, copy.activityPreviewTotalDuration].map(
            (label, index) => (
              <View key={label} style={styles.statistic}>
                <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                  {label}
                </Text>
                <Text variant="titleSmall">
                  {hideActivityStatistics
                    ? '—'
                    : [
                        copy.activityPreviewActivitiesCount,
                        copy.activityPreviewTotalDistanceValue,
                        copy.activityPreviewTotalDurationValue,
                      ][index]}
                </Text>
              </View>
            ),
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, borderWidth: 1, gap: 8, marginTop: 4, padding: 10 },
  heading: { gap: 2 },
  photoStrip: { flexDirection: 'row', gap: 4, height: 76, overflow: 'hidden', position: 'relative' },
  photo: { borderRadius: 6, flex: 1 },
  photoOne: { backgroundColor: '#547A83' },
  photoTwo: { backgroundColor: '#748A66' },
  photoThree: { backgroundColor: '#B98261' },
  hiddenOverlay: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  inactiveBlock: { opacity: 0.55 },
  profileHeader: { alignItems: 'center', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 10, padding: 10 },
  avatar: { alignItems: 'center', borderRadius: 24, height: 42, justifyContent: 'center', width: 42 },
  avatarPhoto: { borderRadius: 21, height: 42, width: 42 },
  profileIdentity: { flex: 1, gap: 2 },
  statusRow: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 38,
    paddingHorizontal: 9,
  },
  statusValue: { flex: 1, textAlign: 'right' },
  section: { borderRadius: 8, borderWidth: 1, gap: 6, padding: 10 },
  community: { flexDirection: 'row', gap: 8, position: 'relative' },
  communityCell: { alignItems: 'center', borderRadius: 8, borderWidth: 1, flex: 1, gap: 2, padding: 8 },
  communityOverlay: { borderRadius: 8 },
  followButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 8,
    minHeight: 38,
    justifyContent: 'center',
  },
  sectionTitle: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statisticsRow: { flexDirection: 'row', gap: 4 },
  statistic: { flex: 1, gap: 3, minWidth: 0 },
});
