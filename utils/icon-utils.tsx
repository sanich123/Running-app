import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { LANGUAGES } from '@const/enums';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function getIconByTypeOfSport(sport: SPORTS_BTNS_VALUES, size: number = 15) {
  if (sport === SPORTS_BTNS_VALUES.run) {
    return <MaterialCommunityIcons name={sport} size={size} />;
  }
  if (sport === SPORTS_BTNS_VALUES.swim) {
    return <MaterialCommunityIcons name={sport} size={size} />;
  }
  if (sport === SPORTS_BTNS_VALUES.ride) {
    return <MaterialCommunityIcons name={SPORTS_BTNS_VALUES.bike} size={size} />;
  }
  if (sport === SPORTS_BTNS_VALUES.workout) {
    return <MaterialCommunityIcons name="dumbbell" size={size} />;
  }
  if (sport === SPORTS_BTNS_VALUES.hike) {
    return <MaterialCommunityIcons name="hiking" size={size} />;
  }
  if (sport === SPORTS_BTNS_VALUES.checkAll) {
    return <MaterialCommunityIcons name="check-all" size={size} />;
  }
  return <MaterialCommunityIcons name={sport} size={size} />;
}

export function getIconNameByTypeOfSport(sport: string) {
  const mapNameToIcon = {
    run: SPORTS_BTNS_VALUES.run,
    bike: SPORTS_BTNS_VALUES.bike,
    hike: 'hiking',
    walk: SPORTS_BTNS_VALUES.walk,
  };
  if (Object.keys(mapNameToIcon).includes(sport)) {
    return mapNameToIcon[sport as keyof typeof mapNameToIcon];
  }
  return '';
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
