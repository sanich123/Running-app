import { useAuth } from '@A/context/auth-context';
import { useGetYearsAndTypesQuery } from '@R/runich-api/runich-api';
import { Picker } from '@react-native-picker/picker';
import { YearsAndTypes, YearsAndTypesPickerProps } from './types';
import { getTypesByYear } from './util';
import { Text } from 'react-native-paper';
import { TouchableOpacity, View } from 'react-native';

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
    isSuccess,
  } = useGetYearsAndTypesQuery(`${user?.id}`, { skip: !user?.id });

  return (
    <>
      {isSuccess && (
        <View>
          <Picker
            prompt="Выберите год"
            selectedValue={selectedYear}
            onValueChange={(year) => {
              const typesInSelectedYear = getTypesByYear({
                yearsAndTypes: availableYearsAndTypes,
                selectedYear: year,
              });
              if (!typesInSelectedYear?.includes(selectedType)) {
                setSelectedType(`${typesInSelectedYear?.[0]}`);
              }
              setSelectedYear(year);
            }}>
            {availableYearsAndTypes
              ?.slice()
              .sort((a: YearsAndTypes, b: YearsAndTypes) => +b.year - +a.year)
              .map(({ year }: YearsAndTypes) => (
                <Picker.Item label={year} value={year} enabled={!isError || !isLoading} key={year} />
              ))}
          </Picker>
          <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden', gap: 5 }}>
            {availableYearsAndTypes
              ?.find(({ year }: YearsAndTypes) => +year === selectedYear)
              ?.types?.map((type: string) => (
                <TouchableOpacity key={type} onPress={() => setSelectedType(type)} style={{ padding: 5 }}>
                  <Text>{type}</Text>
                </TouchableOpacity>
              ))}
            {/* <Picker
              selectedValue={selectedType}
              onValueChange={(type: string) => setSelectedType(type)}
              prompt="Выберите тип активности">
              {availableYearsAndTypes
                ?.find(({ year }: YearsAndTypes) => +year === selectedYear)
                ?.types?.map((type: string) => (
                  <Picker.Item label={type} value={type} enabled={!isError || !isLoading} key={type} />
                ))}
            </Picker> */}
          </View>
        </View>
      )}
    </>
  );
}
