import type { ReactNode } from 'react';
import { act, screen, userEvent } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { MIGRATION_STATES } from './const';
import MigrationFromStrava from './migration-from-strava';
import type { ActivityMigrationJobResponse } from '@R/runich-api/types';

interface MigrationArgs {
  setIsDisabled: (value: boolean) => void;
  setIsUnzipping: (value: boolean) => void;
  setIsRemovingMedia: (value: boolean) => void;
  setIsZipping: (value: boolean) => void;
  setIsSendingArchive: (value: boolean) => void;
  setIsWaitingForServer: (value: boolean) => void;
  setIsDeletingCacheFolder: (value: boolean) => void;
  setIsError: (value: string) => void;
  onArchiveUploadAccepted: (job: ActivityMigrationJobResponse) => void;
}

let latestMigrationArgs: MigrationArgs | undefined;
const mockMigrate = jest.fn().mockImplementation((args: MigrationArgs) => {
  latestMigrationArgs = args;
  return Promise.resolve();
});
const mockExternalNavigate = jest.fn();
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

  it('keeps the migration page open while the server processes the archive', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/activity/migration-strava/jobs/job-id`, () =>
        HttpResponse.json({
          jobId: 'job-id',
          status: 'processing',
          totalActivities: 10,
          processedActivities: 4,
          importedActivities: 3,
          skippedActivities: 1,
          errorMessage: null,
          createdAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          finishedAt: null,
        }),
      ),
    );
    await renderWithProviders(<MigrationFromStrava />);
    await user.press(screen.getByText(MIGRATION_STATES.english.chooseArchive));

    await act(async () => {
      latestMigrationArgs?.onArchiveUploadAccepted({
        jobId: 'job-id',
        status: 'queued',
        totalActivities: 0,
        processedActivities: 0,
        importedActivities: 0,
        skippedActivities: 0,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        startedAt: null,
        finishedAt: null,
      });
    });

    expect(await screen.findAllByText(MIGRATION_STATES.english.processing)).toHaveLength(2);
    expect(await screen.findByText('Activities processed: 4/10')).toBeOnTheScreen();
  });

  it('renders each local archive-processing stage and an error state', async () => {
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
