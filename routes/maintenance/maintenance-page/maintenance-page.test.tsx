import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES, LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import MaintenancePage from './maintenance-page';
import { MAINTENANCE_TEXT } from '../const';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));

describe('MaintenancePage', () => {
  it('returns to the home page from the maintenance screen', async () => {
    const user = userEvent.setup();
    mockReplace.mockClear();
    await renderWithProviders(<MaintenancePage />);
    await user.press(screen.getByText(MAINTENANCE_TEXT[LANGUAGES.russian].home));
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
  });
});
