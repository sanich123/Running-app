import reducer, { LOCATION_INITIAL_STATE } from './location';

describe('Language slice', () => {
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(LOCATION_INITIAL_STATE);
  });
});
