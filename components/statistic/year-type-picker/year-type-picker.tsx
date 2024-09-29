import { YearsAndTypes, YearsAndTypesPickerProps } from './types';
import { getTypesByYear } from './util';
import { Chip, Text, useTheme } from 'react-native-paper';
import { FlatList, View } from 'react-native';
import { useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';

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
    <View style={{ display: 'flex', gap: 15, padding: 10, backgroundColor: colors.background, marginVertical: 15 }}>
      {availableYearsAndTypes?.length ? (
        <>
          <FlatList
            data={availableYearsAndTypes?.slice().sort((a: YearsAndTypes, b: YearsAndTypes) => +b.year - +a.year)}
            renderItem={({ item: { year }, index }) => (
              <Chip
                style={{ marginLeft: index ? 5 : 0 }}
                key={year}
                selected={+year === selectedYear}
                showSelectedOverlay
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
          <FlatList
            data={availableYearsAndTypes?.find(({ year }: YearsAndTypes) => +year === selectedYear)?.types}
            renderItem={({ item: type, index }) => {
              return (
                <Chip
                  key={type}
                  style={{ marginLeft: index ? 5 : 0 }}
                  onPress={() => setSelectedType(type)}
                  selected={type === selectedType}
                  showSelectedOverlay>
                  <Text variant="titleMedium">
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
    </View>
  );
}
