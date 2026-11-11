import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupsPageHeaderActions from './groups-page-header-actions';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
describe('GroupsPageHeaderActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('opens group creation', async () => {
    await renderWithProviders(<GroupsPageHeaderActions />);

    await userEvent.press(screen.getByTestId('groups-create-button'));

    expect(mockPush).toHaveBeenCalledWith('/groups/create');
  });
});
