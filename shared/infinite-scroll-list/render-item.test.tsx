import { renderCardsFunction, keyExtractor } from './utils';

describe('render item', () => {
  it('maps an activity list item to the card props', () => {
    const item: any = {
      description: 'after work',
      title: 'Run',
      date: '2026-08-09',
      sport: 'run',
      photoVideoUrls: [],
      mapPhotoUrl: 'map',
      locations: [],
      duration: 1000,
      distance: 2000,
      id: 'activity-1',
      user_id: 'user-1',
      profile: {},
      _count: { comments: 3 },
    };
    const element = renderCardsFunction({ item });
    expect(element.props).toEqual(
      expect.objectContaining({
        title: 'Run',
        userId: 'user-1',
        id: 'activity-1',
        commentsLength: 3,
        distance: 2000,
      }),
    );
    expect(keyExtractor(item)).toBe('activity-1');
  });
});
