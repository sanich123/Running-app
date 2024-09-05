import { useAuth } from '@A/context/auth-context';
import { useGetYearsAndTypesQuery } from '@R/runich-api/runich-api';
import { Picker } from '@react-native-picker/picker';
import { YearsAndTypes, YearsAndTypesPickerProps } from './types';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { useEffect } from 'react';

export default function YearTypePicker({
  setSelectedYear,
  setSelectedType,
  selectedYear,
  selectedType,
}: YearsAndTypesPickerProps) {
  const { user } = useAuth();

  const {
    data: availableYearsAndTypes,
    isError,
    isLoading,
  } = useGetYearsAndTypesQuery(`${user?.id}`, { skip: !user?.id });

  const types = availableYearsAndTypes?.find(({ year }: YearsAndTypes) => +year === selectedYear).types;

  return (
    <>
      <Picker prompt="Выберите год" selectedValue={selectedYear} onValueChange={(year) => setSelectedYear(year)}>
        {availableYearsAndTypes
          ?.slice()
          .sort((a: YearsAndTypes, b: YearsAndTypes) => +b.year - +a.year)
          .map(({ year }: YearsAndTypes) => (
            <Picker.Item label={year} value={year} enabled={!isError || !isLoading} key={year} />
          ))}
      </Picker>
      <Picker
        selectedValue={selectedType}
        onValueChange={(type: string) => setSelectedType(type)}
        prompt="Выберите тип активности">
        {types?.map((type: string) => (
          <Picker.Item label={type} value={type} enabled={!isError || !isLoading} key={type} />
        ))}
      </Picker>
    </>
  );
}
