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
      userId: 'user-1',
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

  it('maps the current camelCase user id returned by the API', () => {
    const item: any = {
      ...{
        date: '2026-08-09',
        sport: 'run',
        duration: 1000,
        distance: 2000,
        id: 'activity-2',
        profile: {},
        _count: { comments: 0 },
      },
      userId: 'user-2',
    };

    const element = renderCardsFunction({ item });

    expect(element.props.userId).toBe('user-2');
  });
});
