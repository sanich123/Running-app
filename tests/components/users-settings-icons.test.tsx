import UsersSettingsIcons from '../../components/users-settings-icons/users-settings-icons';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

describe('User settings icons', () => {
  it('should correctly renders', () => {
    renderWithProviders(<UsersSettingsIcons />, { store: mockStore });
  });
});
