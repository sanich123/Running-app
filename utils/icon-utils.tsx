import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function getIconByTypeOfSport(sport: SPORTS_BTNS_VALUES, size: number = 15) {
  if (sport === SPORTS_BTNS_VALUES.run) {
    return <MaterialCommunityIcons name={sport} size={size} />;
  } else if (sport === SPORTS_BTNS_VALUES.swim) {
    return <MaterialCommunityIcons name={sport} size={size} />;
  }
  if (sport === SPORTS_BTNS_VALUES.ride) {
    return <MaterialCommunityIcons name={SPORTS_BTNS_VALUES.bike} size={size} />;
  }
  if (sport === SPORTS_BTNS_VALUES.workout) {
    return <MaterialCommunityIcons name="dumbbell" size={size} />;
  }
  return <MaterialCommunityIcons name={sport} size={size} />;
}
