import ErrorComponent from '@C/error-component/error-component';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { useGetMonthStatisticsQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { FlatList, View } from 'react-native';
import { Chip } from 'react-native-paper';

export default function MonthTypesChips({
  userId,
  year,
  month,
  setSelectedType,
  selectedType,
}: {
  setSelectedType: (arg: string) => void;
  selectedType: string;
  userId: string;
  year: string;
  month: string;
}) {
  const {
    data: monthStatistics,
    isSuccess,
    isError,
    error,
  } = useGetMonthStatisticsQuery(
    { userId: `${userId}`, year: `${year}`, month: `${month}` },
    { skip: !userId || !year || !month },
  );
  const { language } = useAppSelector(({ language }) => language);
  const typesOfSport = monthStatistics ? Object.keys(monthStatistics?.activitiesReducedBySport) : [];
  return (
    <View style={{ margin: 10 }}>
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
                {typesOfSport.includes(type) ? MAP_SPORT_TO_TITLE[type as SPORTS_BTNS_VALUES][language] : type}
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
