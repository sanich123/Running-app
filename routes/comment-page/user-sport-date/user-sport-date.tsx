import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import type { SPORTS_BTNS_VALUES } from '@const/sports';

export default function UserSportDate({ sport, date }: { sport: SPORTS_BTNS_VALUES; date: string }) {
  const { language } = useAppSelector(({ settings }) => settings);

  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
      <Text variant="bodyMedium">
        {getIconByTypeOfSport(sport)}
        {` ${formatDate(date, language)} ${getHoursMinutes(date, language)}`}
      </Text>
    </View>
  );
}
