import { renderLikeItem } from './utils';

describe('likes list response mapping', () => {
  it('maps the current camelCase profile userId field', () => {
    const element = renderLikeItem({
      item: { profile: { userId: 'liker-1', name: 'Pavel' } },
    });

    expect(element.props.userId).toBe('liker-1');
  });
});
