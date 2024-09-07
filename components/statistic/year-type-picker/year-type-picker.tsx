import { useAuth } from '@A/context/auth-context';
import { useGetYearsAndTypesQuery } from '@R/runich-api/runich-api';

import { YearsAndTypes, YearsAndTypesPickerProps } from './types';
import { getTypesByYear } from './util';
import { ActivityIndicator, Chip, Text, useTheme } from 'react-native-paper';
import { FlatList, View } from 'react-native';

export default function YearTypePicker({
  setSelectedYear,
  setSelectedType,
  selectedYear,
  selectedType,
}: YearsAndTypesPickerProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const {
    data: availableYearsAndTypes,
    isError,
    isLoading,
    isSuccess,
  } = useGetYearsAndTypesQuery(`${user?.id}`, { skip: !user?.id });
  return (
    <View style={{ gap: 5, padding: 10, backgroundColor: colors.background }}>
      {isSuccess && (
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
                {year}
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
                  {type}
                </Chip>
              );
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </>
      )}
      {isError && <Text variant="bodyMedium">Произошла ошибка во время получения данных</Text>}
      {isLoading && <ActivityIndicator size="small" />}
    </View>
  );
}
