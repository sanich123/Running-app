import reducer, { PROFILE_INITIAL_STATE } from './profile';

describe('Language slice', () => {
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(PROFILE_INITIAL_STATE);
  });
});
