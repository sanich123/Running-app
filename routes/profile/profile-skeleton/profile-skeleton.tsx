import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Skeleton from '@S/skeleton/skeleton';

export default function ProfileSkeleton() {
  const { colors } = useTheme();

  return (
    <View testID="profile-page-skeleton" style={styles.container}>
      <View style={styles.mediaPhotos}>
        <Skeleton style={styles.mediaPhoto} />
        <Skeleton style={styles.mediaPhoto} />
        <Skeleton style={styles.mediaPhoto} />
        <Skeleton style={styles.mediaPhoto} />
      </View>

      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <View style={[styles.avatarRing, { borderColor: colors.primary }]}>
          <Skeleton testID="profile-skeleton-avatar" style={styles.avatar} />
        </View>
        <View style={styles.nicknameWrapper}>
          <Skeleton testID="profile-skeleton-name" style={styles.name} />
          <Skeleton testID="profile-skeleton-surname" style={styles.surname} />
          <Skeleton testID="profile-skeleton-city" style={styles.city} />
        </View>
      </View>

      <View style={[styles.bio, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Skeleton style={styles.aboutTitle} />
        <Skeleton style={styles.bioLine} />
        <Skeleton style={styles.bioLineShort} />
      </View>

      <View testID="profile-skeleton-followers" style={styles.followers}>
        <View style={styles.counter}>
          <Skeleton style={styles.counterTitle} />
          <Skeleton style={styles.counterValue} />
        </View>
        <View style={styles.counter}>
          <Skeleton style={styles.counterTitle} />
          <Skeleton style={styles.counterValue} />
        </View>
      </View>

      <View testID="profile-skeleton-statistics" style={styles.statistics}>
        <Skeleton style={styles.statistic} />
        <Skeleton style={styles.statistic} />
        <Skeleton style={styles.statistic} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch' },
  mediaPhotos: { flexDirection: 'row', gap: 2, marginHorizontal: -12, marginBottom: 10, marginTop: -16 },
  mediaPhoto: { aspectRatio: 1, flex: 1, borderRadius: 0 },
  header: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  avatarRing: { borderRadius: 52, borderWidth: 2, padding: 3 },
  avatar: { width: 92, height: 92, borderRadius: 46 },
  nicknameWrapper: { flex: 1, gap: 8 },
  name: { width: '84%', height: 23 },
  surname: { width: '68%', height: 20 },
  city: { width: '46%', height: 16 },
  bio: { borderRadius: 8, borderWidth: 1, gap: 10, marginVertical: 12, padding: 16 },
  aboutTitle: { width: 58, height: 13 },
  bioLine: { width: '100%', height: 16 },
  bioLineShort: { width: '72%', height: 16 },
  followers: { flexDirection: 'row', gap: 8 },
  counter: { flex: 1, gap: 8, paddingHorizontal: 10, paddingVertical: 8 },
  counterTitle: { width: '70%', height: 13 },
  counterValue: { width: 42, height: 22 },
  statistics: { flexDirection: 'row', gap: 8, marginVertical: 24 },
  statistic: { flex: 1, minHeight: 92 },
});
