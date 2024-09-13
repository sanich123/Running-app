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

export function mapTypeFromValue(value: SPORTS_BTNS_VALUES, language: LANGUAGES) {
  return {
    [LANGUAGES.english]: {},
    [LANGUAGES.russian]: {},
  };
}

export const MAP_SPORT_TO_TITLE = {
  [SPORTS_BTNS_VALUES.run]: {
    [LANGUAGES.english]: 'RUN',
    [LANGUAGES.russian]: 'БЕГ',
  },
  [SPORTS_BTNS_VALUES.bike]: {
    [LANGUAGES.english]: 'CYCLE',
    [LANGUAGES.russian]: 'ВЕЛОСИПЕД',
  },
  [SPORTS_BTNS_VALUES.ride]: {
    [LANGUAGES.english]: 'CYCLE',
    [LANGUAGES.russian]: 'ВЕЛОСИПЕД',
  },
  [SPORTS_BTNS_VALUES.workout]: {
    [LANGUAGES.english]: 'WORKOUT',
    [LANGUAGES.russian]: 'ЗАЛ',
  },
  [SPORTS_BTNS_VALUES.swim]: {
    [LANGUAGES.english]: 'SWIM',
    [LANGUAGES.russian]: 'ПЛАВАНЬЕ',
  },
  [SPORTS_BTNS_VALUES.hike]: {
    [LANGUAGES.english]: 'HIKE',
    [LANGUAGES.russian]: 'ХАЙКИНГ',
  },
  [SPORTS_BTNS_VALUES.checkAll]: {
    [LANGUAGES.english]: 'ALL',
    [LANGUAGES.russian]: 'ВСЕ',
  },
  [SPORTS_BTNS_VALUES.walk]: {
    [LANGUAGES.english]: 'WALK',
    [LANGUAGES.russian]: 'ХОДЬБА',
  },
};
