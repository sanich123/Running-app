import { getInitialProfileSettingsParams, getProfileFormValues } from './profile-settings-params';

describe('profile settings params', () => {
  it('reads scalar values from string and array search params', () => {
    expect(
      getProfileFormValues({
        name: ['Alexander'],
        surname: 'Voronin',
        weight: ['90'],
        city: 'Moscow',
        bio: ['Runner'],
        gender: 'male',
      }),
    ).toEqual({
      name: 'Alexander',
      surname: 'Voronin',
      weight: '90',
      city: 'Moscow',
      bio: 'Runner',
      gender: 'male',
    });
  });

  it('uses empty strings for missing values', () => {
    expect(getProfileFormValues({})).toEqual({
      name: '',
      surname: '',
      weight: '',
      city: '',
      bio: '',
      gender: '',
    });
  });

  it('maps the server profile to initial form params', () => {
    expect(
      getInitialProfileSettingsParams({
        name: null,
        surname: 'Voronin',
        weight: null,
        city: 'Moscow',
        bio: null,
        gender: 'male',
      }),
    ).toEqual({
      name: '',
      surname: 'Voronin',
      weight: '',
      city: 'Moscow',
      bio: '',
      gender: 'male',
    });
  });
});
