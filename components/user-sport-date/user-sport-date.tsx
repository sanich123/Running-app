import { SPORTS_BTNS_VALUES } from '@C/sports-btns/const';
import { useAppSelector } from '@R/typed-hooks';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function UserSportDate({ sport, date }: { sport: SPORTS_BTNS_VALUES; date: Date }) {
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Text variant="bodyMedium">{getIconByTypeOfSport(sport)} </Text>
        <Text variant="bodyMedium">{formatDate(date, language)}</Text>
      </View>
      <Text variant="bodyMedium">{getHoursMinutes(date, language)}</Text>
    </View>
  );
}
