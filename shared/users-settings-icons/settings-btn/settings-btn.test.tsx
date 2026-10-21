import { fireEvent, screen } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import SettingsBtn from './settings-btn';

const mockPush = jest.fn();
let mockPathname = `/${ROUTES.home}`;
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

describe('SettingsBtn', () => {
  beforeEach(() => mockPush.mockClear());

  it('opens settings from another route', async () => {
    mockPathname = `/${ROUTES.home}`;
    await renderWithProviders(<SettingsBtn />);

    fireEvent.press(screen.getByTestId('settingsIcon'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.settings}`);
  });

  it('does not navigate when settings are already open', async () => {
    mockPathname = `/${ROUTES.settings}`;
    await renderWithProviders(<SettingsBtn />);

    fireEvent.press(screen.getByTestId('settingsIcon'));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
