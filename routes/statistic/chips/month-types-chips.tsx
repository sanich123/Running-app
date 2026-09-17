import { FlatList, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Chip, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { LANGUAGES } from '@const/enums';
import { useGetMonthStatisticsQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { getDeviceTimeZone } from '@U/time-zone';
import type { MonthChips } from './types';
import type { SPORTS_BTNS_VALUES } from '@const/sports';

export default function MonthTypesChips({ userId, year, month, setSelectedType, selectedType }: MonthChips) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const timeZone = getDeviceTimeZone();
  const {
    data: monthStatistics,
    isSuccess,
    isError,
    isLoading,
    error,
    refetch,
  } = useGetMonthStatisticsQuery(
    { userId: `${userId}`, year: `${year}`, month: `${month}`, timeZone },
    { skip: !userId || !year || !month },
  );
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;
  const typesOfSport = monthStatistics ? Object.keys(monthStatistics?.activitiesReducedBySport) : [];
  return (
    <Card
      mode="contained"
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
          width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 10,
        },
      ]}>
      <Card.Content style={styles.content}>
        {isLoading ? (
          <ActivityIndicator testID="month-types-loading" size="small" color={colors.primary} />
        ) : isSuccess ? (
          <>
            <Text variant="labelLarge" style={[styles.label, { color: colors.onSurfaceVariant }]}>
              {isRussian ? 'Вид спорта' : 'Sport'}
            </Text>
            <FlatList
              data={typesOfSport}
              keyExtractor={(type) => type}
              renderItem={({ item: type, index }) => (
                <Chip
                  compact
                  mode="outlined"
                  key={type}
                  style={[styles.chip, { marginLeft: index ? 8 : 0, borderColor: colors.outlineVariant }]}
                  onPress={() => setSelectedType(type)}
                  selected={type === selectedType}
                  showSelectedOverlay
                  selectedColor={colors.onPrimaryContainer}
                  textStyle={styles.chipText}>
                  {isRussian && `${type}` in MAP_SPORT_TO_TITLE
                    ? MAP_SPORT_TO_TITLE[type as SPORTS_BTNS_VALUES][language]
                    : type}
                </Chip>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
              updateCellsBatchingPeriod={50}
              removeClippedSubviews={Platform.OS === 'android'}
            />
          </>
        ) : isError ? (
          <ErrorComponent error={error} refetch={refetch} />
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, marginVertical: 8 },
  content: { paddingHorizontal: 14, paddingVertical: 14 },
  label: { fontWeight: '700', marginBottom: 8 },
  chip: { borderRadius: 10 },
  chipText: { fontSize: 13, fontWeight: '700' },
});
