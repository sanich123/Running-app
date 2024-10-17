import ErrorComponent from '@C/error-component/error-component';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { useGetMonthStatisticsQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { FlatList, Platform, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Chip } from 'react-native-paper';
import { MonthChips } from './types';
import { LANGUAGES } from '@const/enums';
import { MAX_MOBILE_WIDTH } from '@const/const';

export default function MonthTypesChips({ userId, year, month, setSelectedType, selectedType }: MonthChips) {
  const { width } = useWindowDimensions();
  const {
    data: monthStatistics,
    isSuccess,
    isError,
    isLoading,
    error,
  } = useGetMonthStatisticsQuery(
    { userId: `${userId}`, year: `${year}`, month: `${month}` },
    { skip: !userId || !year || !month },
  );
  const { language } = useAppSelector(({ language }) => language);
  const isRussian = language === LANGUAGES.russian;
  const typesOfSport = monthStatistics ? Object.keys(monthStatistics?.activitiesReducedBySport) : [];
  return (
    <View
      style={[
        {
          display: 'flex',
          margin: 10,
          width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      {isLoading && <ActivityIndicator size="small" />}
      {isSuccess && (
        <FlatList
          data={typesOfSport}
          renderItem={({ item: type, index }) => {
            return (
              <Chip
                key={type}
                style={{ marginLeft: index ? 5 : 0 }}
                onPress={() => setSelectedType(type)}
                selected={type === selectedType}
                showSelectedOverlay>
                {isRussian && `${type}` in MAP_SPORT_TO_TITLE
                  ? MAP_SPORT_TO_TITLE[type as SPORTS_BTNS_VALUES][language]
                  : type}
              </Chip>
            );
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
      {isError && <ErrorComponent error={error} />}
    </View>
  );
}
