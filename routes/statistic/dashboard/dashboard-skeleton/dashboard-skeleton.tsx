import { StyleSheet, View } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import Skeleton from '@S/skeleton/skeleton';
import { DASHBOARD_LAYOUT } from '../const';
import DashboardHeroSkeleton from '../dashboard-hero-skeleton/dashboard-hero-skeleton';

export default function DashboardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={styles.container} testID="dashboard-skeleton">
      <View style={styles.yearSkeletonRow}>
        <Skeleton style={styles.yearSkeleton} />
      </View>
      <DashboardHeroSkeleton />
      <Card
        mode="contained"
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Card.Content style={styles.cardContent}>
          <Skeleton style={styles.sectionTitleSkeleton} />
          <Skeleton style={styles.chartSkeleton} />
          <Skeleton style={styles.summarySkeleton} />
        </Card.Content>
      </Card>
      <Card
        mode="contained"
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Card.Content style={styles.cardContent}>
          <Skeleton style={styles.sectionTitleSkeleton} />
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} style={styles.sportSkeleton} />
          ))}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', width: '100%' },
  yearSkeletonRow: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
  yearSkeleton: { height: 26, width: 104 },
  card: { borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  cardContent: { paddingHorizontal: DASHBOARD_LAYOUT.cardContentHorizontalPadding },
  sectionTitleSkeleton: { height: 20, marginBottom: 18, width: 150 },
  chartSkeleton: { borderRadius: 14, height: 150, marginBottom: 12, width: '100%' },
  summarySkeleton: { borderRadius: 14, height: 52, width: '100%' },
  sportSkeleton: { borderRadius: 8, height: 32, marginBottom: 12, width: '100%' },
});
