import { act, screen } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { HOME_FEED } from './const';
import HomeFeedSwitcher from './home-feed-switcher';

const labels = {
  [HOME_FEED.my]: 'Мои',
  [HOME_FEED.followers]: 'Подписки',
  [HOME_FEED.favorites]: 'Избранное',
};

describe('HomeFeedSwitcher', () => {
  it('measures the track before rendering the selection indicator', async () => {
    const animation = { start: jest.fn(), stop: jest.fn() };
    const spring = jest.spyOn(Animated, 'spring').mockReturnValue(animation as never);
    const { unmount } = await renderWithProviders(
      <HomeFeedSwitcher value={HOME_FEED.followers} labels={labels} onValueChange={jest.fn()} />,
    );
    const switcher = screen.getByTestId('home-feed-switcher');

    await act(async () => {
      switcher.props.onLayout({ nativeEvent: { layout: { width: 360, height: 48, x: 0, y: 0 } } });
    });

    expect(screen.getByRole('button', { name: 'Подписки' }).props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByRole('button', { name: 'Избранное' }).props.accessibilityState).toEqual({ selected: false });
    expect(screen.getByTestId('home-feed-switcher-indicator')).toBeOnTheScreen();

    unmount();
    spring.mockRestore();
  });
});
