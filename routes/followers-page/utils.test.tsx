import { renderFollowerItem, followerKeyExtractor } from './utils';

describe('followers page response mapping', () => {
  it('maps the current user.profile relation and userId field', () => {
    const item = {
      id: 'friend-1',
      userId: 'follower-1',
      friendId: 'friend-1',
      profileId: 'profile-1',
      createdAt: '2026-08-09T10:00:00.000Z',
      updatedAt: '2026-08-09T10:00:00.000Z',
      user: { profile: { name: 'Ivan', surname: 'Runner', profilePhoto: 'photo' } },
    };
    const element = renderFollowerItem({ item });

    expect(element.props).toEqual(
      expect.objectContaining({
        name: 'Ivan',
        surname: 'Runner',
        profilePhoto: 'photo',
        userId: 'follower-1',
      }),
    );
    expect(followerKeyExtractor(item)).toBe('friend-1');
    expect(followerKeyExtractor({ userId: 'follower-2' })).toBe('follower-2');
  });
});
