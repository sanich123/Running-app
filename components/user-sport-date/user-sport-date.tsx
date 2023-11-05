import { Text } from 'react-native-paper';

import { SportsProps } from '../../constants/types/activity-cart';
import { getIconByTypeOfSport } from '../../utils/icon-utils';
import { formatDate, getHoursMinutes } from '../../utils/time-formatter';

export default function UserSportDate({ sport, date }: { sport: SportsProps; date: Date }) {
  return (
    <>
      <Text variant="bodyMedium">{getIconByTypeOfSport(sport)}</Text>
      <Text variant="bodyMedium">{formatDate(date)}</Text>
      <Text variant="bodyMedium">{getHoursMinutes(date)}</Text>
    </>
  );
}
