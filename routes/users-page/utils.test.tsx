import { renderUserItem, userKeyExtractor } from './utils';

describe('users page response mapping', () => {
  it('maps the current camelCase userId field to the user list item', () => {
    const item = { id: 'profile-1', userId: 'user-1', name: 'Elena' };
    const element = renderUserItem({ item });

    expect(element.props.userId).toBe('user-1');
    expect(userKeyExtractor(item)).toBe('user-1');
  });
});
