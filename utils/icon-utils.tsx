import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { LANGUAGES } from '@const/enums';

type MaterialCommunityIconName = keyof typeof MaterialCommunityIcons.glyphMap;

function getSportIconName(sport: string): MaterialCommunityIconName {
  switch (sport.toLowerCase()) {
    case 'run':
    case 'running':
      return 'run';
    case 'swim':
    case 'swimming':
      return 'swim';
    case 'bike':
    case 'cycling':
    case 'cycle':
    case 'ride':
      return 'bike';
    case 'workout':
    case 'gym':
      return 'dumbbell';
    case 'hike':
    case 'hiking':
      return 'hiking';
    case 'walk':
    case 'walking':
      return 'walk';
    case 'all':
      return 'check-all';
    default:
      return 'help-circle-outline';
  }
}

export function getIconByTypeOfSport(sport: SPORTS_BTNS_VALUES, size = 15) {
  return <MaterialCommunityIcons name={getSportIconName(`${sport}`)} size={size} />;
}

export function getIconNameByTypeOfSport(sport: string) {
  return getSportIconName(sport);
}

export const MAP_SPORT_TO_TITLE = {
  [SPORTS_BTNS_VALUES.run]: {
    [LANGUAGES.english]: 'run',
    [LANGUAGES.russian]: 'бег',
  },
  [SPORTS_BTNS_VALUES.bike]: {
    [LANGUAGES.english]: 'cycle',
    [LANGUAGES.russian]: 'велосипед',
  },
  [SPORTS_BTNS_VALUES.ride]: {
    [LANGUAGES.english]: 'cycle',
    [LANGUAGES.russian]: 'велосипед',
  },
  [SPORTS_BTNS_VALUES.workout]: {
    [LANGUAGES.english]: 'workout',
    [LANGUAGES.russian]: 'зал',
  },
  [SPORTS_BTNS_VALUES.swim]: {
    [LANGUAGES.english]: 'swim',
    [LANGUAGES.russian]: 'плаванье',
  },
  [SPORTS_BTNS_VALUES.hike]: {
    [LANGUAGES.english]: 'hike',
    [LANGUAGES.russian]: 'хайкинг',
  },
  [SPORTS_BTNS_VALUES.checkAll]: {
    [LANGUAGES.english]: 'all',
    [LANGUAGES.russian]: 'все',
  },
  [SPORTS_BTNS_VALUES.walk]: {
    [LANGUAGES.english]: 'walk',
    [LANGUAGES.russian]: 'ходьба',
  },
};
