import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { getIconByTypeOfSport } from '../../utils/icon-utils';
import { formatDate, getHoursMinutes } from '../../utils/time-formatter';
import { SportsProps } from '../card/const ';

export default function UserSportDate({ sport, date }: { sport: SportsProps; date: Date }) {
  const { language } = useSelector(({ language }) => language);
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
