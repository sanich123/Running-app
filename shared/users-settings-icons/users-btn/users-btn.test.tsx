import { fireEvent, screen } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import UsersBtn from './users-btn';

const mockPush = jest.fn();
let mockPathname = `/${ROUTES.home}`;
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

describe('UsersBtn', () => {
  beforeEach(() => mockPush.mockClear());

  it('opens user search from another route', async () => {
    mockPathname = `/${ROUTES.home}`;
    await renderWithProviders(<UsersBtn />);

    fireEvent.press(screen.getByTestId('usersIcon'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.users}`);
  });

  it('does not navigate when user search is already open', async () => {
    mockPathname = `/${ROUTES.users}`;
    await renderWithProviders(<UsersBtn />);

    fireEvent.press(screen.getByTestId('usersIcon'));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
