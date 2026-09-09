import { SPORTS_BTNS_VALUES } from '@const/sports';
import { getIconByTypeOfSport, getIconNameByTypeOfSport } from './icon-utils';

describe('sport icons', () => {
  it.each([
    ['run', 'run'],
    ['running', 'run'],
    ['swim', 'swim'],
    ['swimming', 'swim'],
    ['bike', 'bike'],
    ['cycling', 'bike'],
    ['cycle', 'bike'],
    ['ride', 'bike'],
    ['workout', 'dumbbell'],
    ['gym', 'dumbbell'],
    ['hike', 'hiking'],
    ['hiking', 'hiking'],
    ['walk', 'walk'],
    ['walking', 'walk'],
    ['all', 'check-all'],
    ['unknown', 'help-circle-outline'],
  ])('maps %s to the %s icon', (sport, iconName) => {
    expect(getIconNameByTypeOfSport(sport)).toBe(iconName);
  });

  it('creates a material icon with the requested size', () => {
    const icon = getIconByTypeOfSport(SPORTS_BTNS_VALUES.run, 24);

    expect(icon.props).toEqual(expect.objectContaining({ name: 'run', size: 24 }));
  });
});
