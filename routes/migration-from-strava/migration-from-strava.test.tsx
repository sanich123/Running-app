import type { ReactNode } from 'react';
import { act, screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { MIGRATION_STATES } from './const';
import MigrationFromStrava from './migration-from-strava';

interface MigrationArgs {
  setIsDisabled: (value: boolean) => void;
  setIsSendingArchive: (value: boolean) => void;
  setIsWaitingForServer: (value: boolean) => void;
  onArchiveUploadSuccess: () => void;
}

let latestMigrationArgs: MigrationArgs | undefined;
const mockMigrate = jest.fn().mockImplementation((args: MigrationArgs) => {
  latestMigrationArgs = args;
  return Promise.resolve();
});
const mockExternalNavigate = jest.fn();
const mockReplace = jest.fn();
jest.mock('@U/migration-strava/migration-archive', () => ({
  getMigrationArchiveAndSendToServer: (args: unknown) => mockMigrate(args),
}));
jest.mock('expo-router', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return {
    Link: ({ href, children }: { href: string; children: ReactNode }) => (
      <Pressable testID="strava-export-link" onPress={() => mockExternalNavigate(href)}>
        <Text>{children}</Text>
      </Pressable>
    ),
    useRouter: () => ({ replace: mockReplace }),
  };
});

describe('migration from strava', () => {
  it('starts importing the archive selected by the user', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setUserId('migration-user'));
    await renderWithProviders(<MigrationFromStrava />);
    await user.press(screen.getByText(MIGRATION_STATES.english.chooseArchive));
    expect(mockMigrate).toHaveBeenCalledWith(expect.objectContaining({ userId: 'migration-user' }));
  });

  it('opens Strava export instructions', async () => {
    const user = userEvent.setup();
    mockExternalNavigate.mockClear();
    await renderWithProviders(<MigrationFromStrava />);
    await user.press(screen.getByTestId('strava-export-link'));
    expect(mockExternalNavigate).toHaveBeenCalledWith(expect.stringContaining('support.strava.com'));
  });

  it('shows a separate stage while waiting for the server response', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<MigrationFromStrava />);
    await user.press(screen.getByText(MIGRATION_STATES.english.chooseArchive));

    await act(async () => {
      latestMigrationArgs?.setIsDisabled(true);
      latestMigrationArgs?.setIsSendingArchive(true);
      latestMigrationArgs?.setIsWaitingForServer(true);
    });

    expect(screen.getByText(MIGRATION_STATES.english.waitingForServer)).toBeTruthy();
  });

  it('redirects to the home page after a successful server response', async () => {
    const user = userEvent.setup();
    mockReplace.mockClear();
    await renderWithProviders(<MigrationFromStrava />);
    await user.press(screen.getByText(MIGRATION_STATES.english.chooseArchive));

    await act(async () => {
      latestMigrationArgs?.onArchiveUploadSuccess();
    });

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
  });
});
