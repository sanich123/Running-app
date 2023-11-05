import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { SportsProps } from '../../constants/types/activity-cart';
import { getIconByTypeOfSport } from '../../utils/icon-utils';
import { formatDate, getHoursMinutes } from '../../utils/time-formatter';

export default function UserSportDate({ sport, date }: { sport: SportsProps; date: Date }) {
  return (
    <View>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Text variant="bodyMedium">{getIconByTypeOfSport(sport)} </Text>
        <Text variant="bodyMedium">{formatDate(date)}</Text>
      </View>

      <Text variant="bodyMedium">{getHoursMinutes(date)}</Text>
    </View>
  );
}
