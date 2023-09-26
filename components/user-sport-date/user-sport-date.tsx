import { SportsProps } from '@const/types/activity-cart';
import { getIconByTypeOfSport } from '@u/icon-utils';
import { formatDate, getHoursMinutes } from '@u/time-formatter';
import { Text } from 'react-native-paper';

export default function UserSportDate({ sport, date }: { sport: SportsProps; date: Date }) {
  return (
    <Text variant="bodyMedium">
      {getIconByTypeOfSport(sport)} {formatDate(date)} {getHoursMinutes(date)}
    </Text>
  );
}
