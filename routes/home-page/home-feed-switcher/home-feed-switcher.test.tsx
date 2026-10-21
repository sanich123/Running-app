import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { HOME_FEED, HOME_FEED_COPY } from '../const';
import HomeFeedSwitcher from './home-feed-switcher';

describe('HomeFeedSwitcher', () => {
  it('renders translated tabs and marks the active feed', async () => {
    const { store } = await renderWithProviders(
      <HomeFeedSwitcher value={HOME_FEED.followers} onValueChange={jest.fn()} />,
    );
    const labels = HOME_FEED_COPY[store.getState().settings.language];

    expect(screen.getByRole('tab', { name: labels.followers, selected: true })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: labels.favorites, selected: false })).toBeOnTheScreen();
  });

  it('changes the selected feed when a tab is pressed', async () => {
    const onValueChange = jest.fn();
    const user = userEvent.setup();
    const { store } = await renderWithProviders(
      <HomeFeedSwitcher value={HOME_FEED.followers} onValueChange={onValueChange} />,
    );
    const labels = HOME_FEED_COPY[store.getState().settings.language];

    await user.press(screen.getByRole('tab', { name: labels.favorites }));

    expect(onValueChange).toHaveBeenCalledWith(HOME_FEED.favorites);
  });
});
