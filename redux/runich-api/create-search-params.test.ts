import { createSearchParams } from './create-search-params';

describe('createSearchParams', () => {
  it('encodes values and omits nullish parameters', () => {
    expect(
      createSearchParams({
        name: 'Alexander Voronin',
        cursor: 'date/id+index',
        empty: '',
        disabled: false,
        count: 0,
        skipped: undefined,
        missing: null,
      }),
    ).toBe('?name=Alexander%20Voronin&cursor=date%2Fid%2Bindex&empty=&disabled=false&count=0');
  });

  it('serializes arrays as repeated query keys', () => {
    expect(createSearchParams({ ids: ['activity-1', 'activity-2', null] })).toBe('?ids=activity-1&ids=activity-2');
  });

  it('returns an empty string when there are no values', () => {
    expect(createSearchParams({ cursor: undefined })).toBe('');
  });
});
