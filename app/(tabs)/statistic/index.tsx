import { ScrollView, View } from 'react-native';
import YearTypePicker from '@C/statistic/year-type-picker/year-type-picker';
import { useState } from 'react';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import Charts from '@C/statistic/charts/charts';
import { ActivityIndicator } from 'react-native-paper';
import { useGetAnnualStatisticsByYearAndCategoryQuery } from '@R/runich-api/runich-api';
import { useAuth } from '@A/context/auth-context';
import ErrorComponent from '@C/error-component/error-component';
import { Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';

export default function Statistics() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState<string>(SPORTS_BTNS_VALUES.run);
  const { user } = useAuth();
  const { language } = useAppSelector(({ language }) => language);
  const {
    data: yearStats,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useGetAnnualStatisticsByYearAndCategoryQuery(
    {
      userId: `${user?.id}`,
      year: `${selectedYear}`,
      category: selectedType,
    },
    { skip: !user?.id },
  );
  const isUserHasStatistics = yearStats?.[selectedYear].totalYearItems;

  return (
    <ScrollView
      contentContainerStyle={[
        (isLoading || isError || !isUserHasStatistics) && { flex: 1, alignItems: 'center', justifyContent: 'center' },
      ]}>
      <View>
        {isLoading && <ActivityIndicator size="large" />}
        {isError && <ErrorComponent error={error} />}
        {isSuccess && (
          <>
            {isUserHasStatistics ? (
              <>
                <YearTypePicker
                  setSelectedYear={setSelectedYear}
                  setSelectedType={setSelectedType}
                  selectedYear={selectedYear}
                  selectedType={selectedType}
                  availableYearsAndTypes={yearStats?.availableYearsAndTypes}
                />
                <Charts year={selectedYear} months={yearStats?.months} />
              </>
            ) : (
              <Text variant="titleLarge">{`${language === LANGUAGES.english ? 'There are no activities, so there are no statistics' : 'Пока нет активностей и нет статистики'}`}</Text>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
