import reducer from './language';
import { LANGUAGES } from '../../constants/enums';

describe('Language slice', () => {
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({
      language: LANGUAGES.english,
    });
  });
});
