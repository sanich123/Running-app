import { MaterialCommunityIcons } from '@expo/vector-icons';

export function getIconByTypeOfSport(sport: 'run' | 'swim' | 'bike') {
  const size = 15;
  if (sport === 'run') {
    return <MaterialCommunityIcons name="run" size={size} />;
  } else if (sport === 'swim') {
    return <MaterialCommunityIcons name="swim" size={size} />;
  } else {
    return <MaterialCommunityIcons name="bike" size={size} />;
  }
}
