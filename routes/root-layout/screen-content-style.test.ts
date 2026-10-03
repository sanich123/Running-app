import { ROUTES } from '@const/enums';
import { ANDROID_BOTTOM_INSET_HANDLED_ROUTES, getRootScreenContentStyle } from './screen-content-style';

describe('getRootScreenContentStyle', () => {
  it('adds the Android navigation inset to regular stack screens', () => {
    expect(
      getRootScreenContentStyle({
        backgroundColor: '#ffffff',
        bottomInset: 24,
        platform: 'android',
        routeName: `${ROUTES.settings}/${ROUTES.index}`,
      }),
    ).toEqual({ backgroundColor: '#ffffff', paddingBottom: 24 });
  });

  it.each([...ANDROID_BOTTOM_INSET_HANDLED_ROUTES])('does not duplicate the inset on %s', (routeName) => {
    expect(
      getRootScreenContentStyle({
        backgroundColor: '#ffffff',
        bottomInset: 24,
        platform: 'android',
        routeName,
      }),
    ).toEqual({ backgroundColor: '#ffffff', paddingBottom: 0 });
  });

  it.each(['ios', 'web'])('does not change %s screen insets', (platform) => {
    expect(
      getRootScreenContentStyle({
        backgroundColor: '#ffffff',
        bottomInset: 24,
        platform,
        routeName: `${ROUTES.settings}/${ROUTES.index}`,
      }),
    ).toEqual({ backgroundColor: '#ffffff' });
  });
});
