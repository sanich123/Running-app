import UsersSettingsIcons from './users-settings-icons';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('User settings icons', () => {
  it('should correctly renders', () => {
    renderWithProviders(<UsersSettingsIcons />, { store: mockStore });
  });
});
