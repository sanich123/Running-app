import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import {
  ACTIVITY_MEDIA_HEIGHT_RATIO,
  ACTIVITY_MEDIA_MAX_HEIGHT,
  ACTIVITY_MEDIA_MIN_HEIGHT,
} from '@S/card/media-list/const';
import Skeleton from '@S/skeleton/skeleton';

const SKELETON_ITEMS = [0, 1];
const METRICS = [0, 1, 2];
const ACTIONS = [0, 1, 2];

export default function HomeFeedSkeleton() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const cardWidth = width < MAX_MOBILE_WIDTH ? Math.max(width, 0) : MAX_MOBILE_WIDTH;
  const mediaHeight = Math.min(
    Math.max(cardWidth * ACTIVITY_MEDIA_HEIGHT_RATIO, ACTIVITY_MEDIA_MIN_HEIGHT),
    ACTIVITY_MEDIA_MAX_HEIGHT,
  );

  return (
    <View testID="home-feed-skeleton" style={styles.list}>
      {SKELETON_ITEMS.map((item) => (
        <View
          key={item}
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
              width: cardWidth,
            },
          ]}>
          <View style={styles.userInfo}>
            <Skeleton style={styles.avatar} />
            <View style={styles.userText}>
              <Skeleton style={styles.name} />
              <Skeleton style={styles.date} />
            </View>
          </View>
          <Skeleton style={[styles.media, { height: mediaHeight }]} />
          <View style={styles.metrics}>
            {METRICS.map((metric) => (
              <View key={metric} style={styles.metric}>
                <Skeleton style={styles.metricLabel} />
                <Skeleton style={styles.metricValue} />
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            {ACTIONS.map((action) => (
              <Skeleton key={action} style={styles.action} />
            ))}
            <Skeleton style={styles.editAction} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { alignSelf: 'stretch' },
  card: {
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  userInfo: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  avatar: { borderRadius: 20, height: 40, width: 40 },
  userText: { flex: 1, gap: 7 },
  name: { height: 16, width: '48%' },
  date: { height: 13, width: '68%' },
  media: { borderRadius: 0, width: '100%' },
  metrics: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  metric: { flex: 1, gap: 5 },
  metricLabel: { height: 12, width: '76%' },
  metricValue: { height: 18, width: '58%' },
  actions: { alignItems: 'center', flexDirection: 'row', gap: 20, paddingHorizontal: 16, paddingBottom: 14 },
  action: { borderRadius: 12, height: 24, width: 24 },
  editAction: { borderRadius: 12, height: 24, marginLeft: 'auto', width: 30 },
});
