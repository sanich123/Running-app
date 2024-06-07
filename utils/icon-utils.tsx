import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function getIconByTypeOfSport(sport: SPORTS_BTNS_VALUES) {
  const size = 15;
  if (sport === SPORTS_BTNS_VALUES.run) {
    return <MaterialCommunityIcons name={sport} size={size} />;
  } else if (sport === SPORTS_BTNS_VALUES.swim) {
    return <MaterialCommunityIcons name={sport} size={size} />;
  }
  return <MaterialCommunityIcons name={sport} size={size} />;
}
