import { getInitialProfileSettingsParams, getProfileFormValues } from './profile-settings-params';

describe('profile settings params', () => {
  it('reads scalar values from string and array search params', () => {
    expect(
      getProfileFormValues({
        name: ['Alexander'],
        surname: 'Voronin',
        weight: ['90'],
        height: ['180'],
        age: '35',
        city: 'Moscow',
        bio: ['Runner'],
        gender: 'male',
        restingHeartRate: '55',
        maxHeartRate: '190',
      }),
    ).toEqual({
      name: 'Alexander',
      surname: 'Voronin',
      weight: '90',
      height: '180',
      age: '35',
      city: 'Moscow',
      bio: 'Runner',
      gender: 'male',
      restingHeartRate: '55',
      maxHeartRate: '190',
    });
  });

  it('uses empty strings for missing values', () => {
    expect(getProfileFormValues({})).toEqual({
      name: '',
      surname: '',
      weight: '',
      height: '',
      age: '',
      city: '',
      bio: '',
      gender: '',
      restingHeartRate: '',
      maxHeartRate: '',
    });
  });

  it('maps the server profile to initial form params', () => {
    expect(
      getInitialProfileSettingsParams({
        name: null,
        surname: 'Voronin',
        weight: null,
        height: null,
        age: null,
        city: 'Moscow',
        bio: null,
        gender: 'male',
        restingHeartRate: null,
        maxHeartRate: null,
      }),
    ).toEqual({
      name: '',
      surname: 'Voronin',
      weight: '',
      height: '',
      age: '',
      city: 'Moscow',
      bio: '',
      gender: 'male',
      restingHeartRate: '',
      maxHeartRate: '',
    });
  });

  it('bounds legacy long profile values before they reach the form', () => {
    const result = getProfileFormValues({
      name: 'N'.repeat(60),
      surname: 'S'.repeat(60),
      city: 'C'.repeat(120),
      bio: 'B'.repeat(520),
      weight: '70kg999',
    });

    expect(result.name).toHaveLength(50);
    expect(result.surname).toHaveLength(50);
    expect(result.city).toHaveLength(100);
    expect(result.bio).toHaveLength(500);
    expect(result.weight).toBe('200');
  });
});
