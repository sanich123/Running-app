import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { HOME_FEED_ERROR_COPY } from '../const';
import HomeFeedError from './home-feed-error';

describe('HomeFeedError', () => {
  it('shows the error state and retries loading the feed', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    const refetch = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <HomeFeedError error={{ status: 'FETCH_ERROR', error: 'Network request failed' }} refetch={refetch} />,
      { store: mockStore },
    );

    expect(screen.getByText(HOME_FEED_ERROR_COPY[LANGUAGES.russian].title)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: HOME_FEED_ERROR_COPY[LANGUAGES.russian].retry }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
