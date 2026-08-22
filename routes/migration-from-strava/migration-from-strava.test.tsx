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
  setIsUnzipping: (value: boolean) => void;
  setIsRemovingMedia: (value: boolean) => void;
  setIsZipping: (value: boolean) => void;
  setIsSendingArchive: (value: boolean) => void;
  setIsWaitingForServer: (value: boolean) => void;
  setIsDeletingCacheFolder: (value: boolean) => void;
  setIsSuccess: (value: boolean) => void;
  setIsError: (value: string) => void;
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
  beforeEach(() => {
    latestMigrationArgs = undefined;
    mockMigrate.mockClear();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
  });

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

  it('renders each archive-processing stage and the final success or error state', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<MigrationFromStrava />);
    await user.press(screen.getByText(MIGRATION_STATES.english.chooseArchive));
    const args = latestMigrationArgs!;

    await act(async () => {
      args.setIsDisabled(true);
      args.setIsUnzipping(true);
    });
    expect(screen.getByText(MIGRATION_STATES.english.unzipping)).toBeOnTheScreen();
    expect(screen.getByText(MIGRATION_STATES.english.unzip)).toBeOnTheScreen();

    await act(async () => {
      args.setIsUnzipping(false);
      args.setIsRemovingMedia(true);
    });
    expect(screen.getByText(MIGRATION_STATES.english.remove)).toBeOnTheScreen();
    expect(screen.getByText(MIGRATION_STATES.english.removing)).toBeOnTheScreen();

    await act(async () => {
      args.setIsRemovingMedia(false);
      args.setIsZipping(true);
    });
    expect(screen.getByText(MIGRATION_STATES.english.zipping)).toBeOnTheScreen();
    expect(screen.getByText(MIGRATION_STATES.english.zip)).toBeOnTheScreen();

    await act(async () => {
      args.setIsZipping(false);
      args.setIsSendingArchive(true);
      args.setIsWaitingForServer(false);
    });
    expect(screen.getByText(MIGRATION_STATES.english.transfer)).toBeOnTheScreen();
    expect(screen.getByText(MIGRATION_STATES.english.sending)).toBeOnTheScreen();

    await act(async () => {
      args.setIsWaitingForServer(true);
    });
    expect(screen.getByText(MIGRATION_STATES.english.waitingForServer)).toBeOnTheScreen();
    expect(screen.getByText(MIGRATION_STATES.english.waiting)).toBeOnTheScreen();

    await act(async () => {
      args.setIsSendingArchive(false);
      args.setIsWaitingForServer(false);
      args.setIsDeletingCacheFolder(true);
    });
    expect(screen.getByText(MIGRATION_STATES.english.cleaning)).toBeOnTheScreen();
    expect(screen.getByText(MIGRATION_STATES.english.clean)).toBeOnTheScreen();

    await act(async () => {
      args.setIsDeletingCacheFolder(false);
      args.setIsSuccess(true);
    });
    expect(screen.getByText(MIGRATION_STATES.english.successSending)).toBeOnTheScreen();
    expect(screen.getByText(MIGRATION_STATES.english.success)).toBeOnTheScreen();

    await act(async () => {
      args.setIsSuccess(false);
      args.setIsError('archive failed');
    });
    expect(screen.getAllByText(MIGRATION_STATES.english.error)).toHaveLength(2);
  });

  it('renders Russian copy for the migration instructions', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<MigrationFromStrava />);

    expect(screen.getByText('Миграция из Strava')).toBeOnTheScreen();
    expect(screen.getByText(MIGRATION_STATES.russian.chooseArchive)).toBeOnTheScreen();
  });
});
