import { Text } from 'react-native-paper';

import { SportsProps } from '../../constants/types/activity-cart';
import { getIconByTypeOfSport } from '../../utils/icon-utils';
import { formatDate } from '../../utils/time-formatter';

export default function UserSportDate({ sport, date }: { sport: SportsProps; date: Date }) {
  return (
    <Text variant="bodyMedium">
      {getIconByTypeOfSport(sport)} {formatDate(date)}
    </Text>
  );
}
