import { LANGUAGES } from '@const/enums';
import reducer, { LANGUAGE_INITIAL_STATE, changeLanguage } from './language';

describe('Language slice', () => {
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: '' })).toEqual(LANGUAGE_INITIAL_STATE);
  });
  it('should change language', () => {
    expect(reducer(LANGUAGE_INITIAL_STATE, changeLanguage(LANGUAGES.russian))).toEqual({
      language: LANGUAGES.russian,
      theme: null,
    });
  });
});
