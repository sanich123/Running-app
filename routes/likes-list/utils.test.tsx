import { renderLikeItem } from './utils';

describe('likes list response mapping', () => {
  it('maps the current camelCase profile userId field', () => {
    const element = renderLikeItem({
      item: {
        id: 'like-1',
        date: '2026-08-09T10:00:00.000Z',
        authorId: 'liker-1',
        activityId: 'activity-1',
        profileId: 'profile-1',
        profile: { userId: 'liker-1', name: 'Pavel' },
      },
    });

    expect(element.props.userId).toBe('liker-1');
  });
});
