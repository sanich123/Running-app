import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { MIGRATION_STATES } from './const';
import MigrationFromStrava from './migration-from-strava';

const mockMigrate = jest.fn().mockResolvedValue(undefined);
jest.mock('@U/migration-strava/migration-archive', () => ({
  getMigrationArchiveAndSendToServer: (args: unknown) => mockMigrate(args),
}));

describe('migration from strava', () => {
  it('starts importing the archive selected by the user', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setUserId('migration-user'));
    await renderWithProviders(<MigrationFromStrava />);
    await user.press(screen.getByText(MIGRATION_STATES.english.chooseArchive));
    expect(mockMigrate).toHaveBeenCalledWith(expect.objectContaining({ userId: 'migration-user' }));
  });
});
