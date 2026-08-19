import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { EMPTY_USERS_LIST } from './const';
import EmptyUsersList from './empty-list';

describe('EmptyUsersList', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.english)));
  it('is hidden for the initial state', async () => {
    await renderWithProviders(<EmptyUsersList isInitial />);
    expect(screen.queryByText(EMPTY_USERS_LIST.english)).not.toBeOnTheScreen();
  });

  it('shows an empty result message after searching', async () => {
    await renderWithProviders(<EmptyUsersList isInitial={false} />);
    expect(screen.getByText(EMPTY_USERS_LIST.english)).toBeOnTheScreen();
  });
});
