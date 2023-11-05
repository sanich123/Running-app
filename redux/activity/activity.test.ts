import reducer, { ACTIVITY_INITIAL_STATE } from './activity';

describe('Language slice', () => {
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(ACTIVITY_INITIAL_STATE);
  });
});
