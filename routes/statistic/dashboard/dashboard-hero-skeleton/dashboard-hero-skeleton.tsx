import { StyleSheet, View } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import Skeleton from '@S/skeleton/skeleton';
import { DASHBOARD_LAYOUT } from '../const';
import { withAlpha } from '../utils';

export default function DashboardHeroSkeleton() {
  const { colors } = useTheme();

  return (
    <Card
      mode="contained"
      style={[styles.heroCard, { backgroundColor: colors.primaryContainer }]}
      testID="dashboard-hero-skeleton">
      <Card.Content style={styles.cardContent}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroMainMetric}>
            <Skeleton style={styles.labelSkeleton} />
            <Skeleton style={styles.heroValueSkeleton} />
          </View>
          <Skeleton style={styles.iconSkeleton} />
        </View>
        <View style={[styles.summaryRow, { borderTopColor: withAlpha(colors.onPrimaryContainer, 0.16) }]}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={styles.summaryMetric}>
              <Skeleton style={styles.summaryLabelSkeleton} />
              <Skeleton style={styles.summaryValueSkeleton} />
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContent: { paddingHorizontal: DASHBOARD_LAYOUT.cardContentHorizontalPadding },
  heroCard: { borderRadius: 24, borderWidth: 1, marginBottom: 12 },
  heroTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heroMainMetric: { flex: 1, minWidth: 0 },
  summaryRow: { borderTopWidth: 1, flexDirection: 'row', marginTop: 18, paddingTop: 13 },
  summaryMetric: { alignItems: 'center', flex: 1, minWidth: 0 },
  labelSkeleton: { borderRadius: 4, height: 12, marginTop: 5, width: 70 },
  heroValueSkeleton: { borderRadius: 8, height: 42, marginTop: 7, width: 126 },
  iconSkeleton: { borderRadius: 16, height: 50, width: 50 },
  summaryLabelSkeleton: { height: 10, width: 54 },
  summaryValueSkeleton: { borderRadius: 5, height: 21, marginTop: 5, width: 42 },
});
