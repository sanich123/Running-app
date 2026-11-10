import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupsFilterControls from './groups-filter-controls';
import { GROUPS_COPY } from '../../const';

describe('GroupsFilterControls', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.english)));

  it('changes scope, sport and search filters and clears search', async () => {
    const onChange = jest.fn();
    await renderWithProviders(
      <GroupsFilterControls filters={{ scope: 'all', search: '', sport: null }} onChange={onChange} />,
    );

    await userEvent.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].myGroups));
    expect(onChange).toHaveBeenCalledWith({ scope: 'mine', search: '', sport: null });

    await userEvent.press(screen.getByTestId('groups-sport-filter'));
    await userEvent.press(screen.getByTestId('groups-sport-filter-bike'));
    expect(onChange).toHaveBeenLastCalledWith({ scope: 'all', search: '', sport: 'bike' });

    fireEvent.changeText(screen.getByTestId('search-groups'), 'morning');
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ scope: 'all', search: 'morning', sport: null }));
    fireEvent.press(screen.getByTestId('clear-groups-search'));
    expect(onChange).toHaveBeenLastCalledWith({ scope: 'all', search: '', sport: null });
  });
});
