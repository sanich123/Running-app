import { LANGUAGES } from '../../constants/enums';
import reducer, { LANGUAGE_INITIAL_STATE, changeLanguage } from '../../redux/language/language';

describe('Language slice', () => {
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(LANGUAGE_INITIAL_STATE);
  });
  it('should change language', () => {
    expect(reducer(LANGUAGE_INITIAL_STATE, changeLanguage(LANGUAGES.russian))).toEqual({ language: LANGUAGES.russian });
  });
});
