import { FlatList, StyleSheet } from 'react-native';
import { Chip, Card, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { getTypesByYear } from './util';
import type { YearsAndTypes, YearsAndTypesPickerProps } from './types';
import type { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';

export default function YearTypePicker({
  setSelectedYear,
  setSelectedType,
  selectedYear,
  selectedType,
  availableYearsAndTypes,
}: YearsAndTypesPickerProps) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const isRussian = language === LANGUAGES.russian;

  return (
    <Card
      mode="contained"
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <Card.Content style={styles.content}>
        {availableYearsAndTypes?.length ? (
          <>
            <Text variant="labelLarge" style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
              {isRussian ? 'Год' : 'Year'}
            </Text>
            <FlatList
              data={availableYearsAndTypes?.slice().sort((a: YearsAndTypes, b: YearsAndTypes) => +b.year - +a.year)}
              renderItem={({ item: { year }, index }) => (
                <Chip
                  compact
                  mode="outlined"
                  style={[styles.chip, { marginLeft: index ? 8 : 0, borderColor: colors.outlineVariant }]}
                  key={year}
                  selected={+year === selectedYear}
                  showSelectedOverlay
                  selectedColor={colors.onPrimaryContainer}
                  textStyle={styles.chipText}
                  onPress={() => {
                    const typesInSelectedYear = getTypesByYear({
                      yearsAndTypes: availableYearsAndTypes,
                      selectedYear: +year,
                    });
                    if (!typesInSelectedYear?.includes(selectedType)) {
                      setSelectedType(`${typesInSelectedYear?.[0]}`);
                    }
                    setSelectedYear(+year);
                  }}>
                  <Text variant="titleMedium">{year}</Text>
                </Chip>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
            <Text
              variant="labelLarge"
              style={[styles.sectionLabel, styles.sportLabel, { color: colors.onSurfaceVariant }]}>
              {isRussian ? 'Вид спорта' : 'Sport'}
            </Text>
            <FlatList
              data={availableYearsAndTypes?.find(({ year }: YearsAndTypes) => +year === selectedYear)?.types}
              renderItem={({ item: type, index }) => {
                return (
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
                    <Text variant="labelLarge">
                      {isRussian && `${type}` in MAP_SPORT_TO_TITLE
                        ? MAP_SPORT_TO_TITLE[type as SPORTS_BTNS_VALUES][language]
                        : type}
                    </Text>
                  </Chip>
                );
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, marginHorizontal: 10, marginVertical: 8 },
  content: { paddingHorizontal: 14, paddingVertical: 14 },
  sectionLabel: { fontWeight: '700', marginBottom: 8 },
  sportLabel: { marginTop: 16 },
  chip: { borderRadius: 10 },
  chipText: { fontSize: 13, fontWeight: '700' },
});
