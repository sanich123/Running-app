import { LANGUAGES } from '@const/enums';
import reducer, { SETTINGS_INITIAL_STATE, changeLanguage } from './settings';

describe('Settings slice', () => {
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: '' })).toEqual(SETTINGS_INITIAL_STATE);
  });
  it('should change language', () => {
    expect(reducer(SETTINGS_INITIAL_STATE, changeLanguage(LANGUAGES.russian))).toEqual({
      language: LANGUAGES.russian,
      theme: null,
    });
  });
});
