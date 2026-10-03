import type { ReactNode } from 'react';
import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { resetMigration, setMigrationError, setMigrationJob } from '@R/slices/migration/migration';
import { changeLanguage } from '@R/slices/settings/settings';
import * as errorToastModule from '@S/error-toast/error-toast';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
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
  setUploadProgress: (value: number) => void;
  setIsError: (value: string) => void;
  onCancelReady: (cancel: (() => void) | null) => void;
  onArchiveUploadAccepted: (job: ActivityMigrationJobResponse) => void;
}

let latestMigrationArgs: MigrationArgs | undefined;
const mockMigrate = jest.fn().mockImplementation((args: MigrationArgs) => {
  latestMigrationArgs = args;
  return Promise.resolve();
});
const mockExternalNavigate = jest.fn();
const mockReplace = jest.fn();
jest.mock('@U/migration-strava/migration-archive', () => ({
  startStravaMigration: (args: unknown) => mockMigrate(args),
}));
jest.mock('expo-router', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return {
    Link: ({ href, children }: { href: string; children: ReactNode }) => (
      <Pressable
        testID={href.includes('support.strava') ? 'strava-export-link' : 'feedback-link'}
        onPress={() => mockExternalNavigate(href)}>
        <Text>{children}</Text>
      </Pressable>
    ),
    useRouter: () => ({ replace: mockReplace }),
    useIsFocused: () => true,
    useNavigation: () => ({
      addListener: () => () => undefined,
      isFocused: () => true,
    }),
  };
});

describe('migration from strava', () => {
  beforeEach(() => {
    latestMigrationArgs = undefined;
    mockMigrate.mockClear();
    mockReplace.mockClear();
    mockStore.dispatch(resetMigration());
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    server.use(http.get(`${BASE_URL}/activity/migration-strava/current`, () => HttpResponse.json(null)));
  });

  const renderMigrationPage = () => renderWithProviders(<MigrationFromStrava />);

  it('starts importing the archive selected by the user', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setMockUserId('migration-user'));
    await renderMigrationPage();
    await user.press(screen.getByTestId('migration-choose'));
    expect(mockMigrate).toHaveBeenCalledWith(expect.objectContaining({ userId: 'migration-user' }));
  });

  it('shows an unexpected migration error to the user', async () => {
    const user = userEvent.setup();
    const error = new Error('unexpected migration failure');
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    mockMigrate.mockRejectedValueOnce(error);
    await renderMigrationPage();

    await user.press(screen.getByTestId('migration-choose'));

    await waitFor(() => expect(errorToast).toHaveBeenCalledWith('Ошибка миграции из Strava', error));
    errorToast.mockRestore();
  });

  it('opens Strava export instructions', async () => {
    const user = userEvent.setup();
    mockExternalNavigate.mockClear();
    await renderMigrationPage();
    await user.press(screen.getByTestId('strava-export-link'));
    expect(mockExternalNavigate).toHaveBeenCalledWith(expect.stringContaining('support.strava.com'));
  });

  it('shows a separate stage while waiting for the server response', async () => {
    const user = userEvent.setup();
    await renderMigrationPage();
    await user.press(screen.getByTestId('migration-choose'));

    await act(async () => {
      latestMigrationArgs?.setIsDisabled(true);
      latestMigrationArgs?.setIsSendingArchive(true);
      latestMigrationArgs?.setIsWaitingForServer(true);
    });

    expect(screen.getByText(MIGRATION_STATES.english.waitingForServer)).toBeTruthy();
  });

  it('shows upload progress and lets the user cancel the migration', async () => {
    const user = userEvent.setup();
    await renderMigrationPage();
    await user.press(screen.getByTestId('migration-choose'));

    const cancel = jest.fn();
    await act(async () => {
      latestMigrationArgs?.setIsDisabled(true);
      latestMigrationArgs?.setIsSendingArchive(true);
      latestMigrationArgs?.setUploadProgress(0.42);
      latestMigrationArgs?.onCancelReady(cancel);
    });

    expect(screen.getByTestId('migration-upload-progress')).toBeOnTheScreen();
    expect(screen.getByText(MIGRATION_STATES.english.uploadProgress)).toBeOnTheScreen();
    expect(screen.getByText('42%')).toBeOnTheScreen();

    await user.press(screen.getByTestId('migration-cancel'));
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('keeps the migration page open while the server processes the archive', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/activity/migration-strava/jobs/job-id`, () =>
        HttpResponse.json({
          jobId: 'job-id',
          status: 'processing',
          uploadBytesReceived: 0,
          uploadBytesTotal: 0,
          queuePosition: null,
          queueAhead: 0,
          queueSize: 1,
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
    await renderMigrationPage();
    await user.press(screen.getByTestId('migration-choose'));

    await act(async () => {
      latestMigrationArgs?.onArchiveUploadAccepted({
        jobId: 'job-id',
        status: 'queued',
        uploadBytesReceived: 0,
        uploadBytesTotal: 0,
        queuePosition: 1,
        queueAhead: 0,
        queueSize: 1,
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

    expect(await screen.findByText(MIGRATION_STATES.english.processing)).toBeOnTheScreen();
    expect(await screen.findByText('4/10')).toBeOnTheScreen();
    expect(await screen.findByText(MIGRATION_STATES.english.imported)).toBeOnTheScreen();
    expect(await screen.findByText(MIGRATION_STATES.english.skipped)).toBeOnTheScreen();
  });

  it('renders active migration progress restored from global state', async () => {
    mockStore.dispatch(
      setMigrationJob({
        jobId: 'job-id',
        status: 'processing',
        uploadBytesReceived: 0,
        uploadBytesTotal: 0,
        queuePosition: null,
        queueAhead: 0,
        queueSize: 1,
        totalActivities: 20,
        processedActivities: 7,
        importedActivities: 6,
        skippedActivities: 1,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        finishedAt: null,
      }),
    );

    await renderWithProviders(<MigrationFromStrava />);
    expect(screen.getByText('7/20')).toBeOnTheScreen();
    expect(screen.getByText(MIGRATION_STATES.english.processing)).toBeOnTheScreen();
  });

  it('shows server confirmation instead of a transfer error after all bytes arrive', async () => {
    mockStore.dispatch(setMigrationError('Ошибка передачи архива: Read timed out'));
    mockStore.dispatch(
      setMigrationJob({
        jobId: 'job-id',
        status: 'uploading',
        uploadBytesReceived: 100,
        uploadBytesTotal: 100,
        queuePosition: null,
        queueAhead: 0,
        queueSize: 0,
        totalActivities: 0,
        processedActivities: 0,
        importedActivities: 0,
        skippedActivities: 0,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        startedAt: null,
        finishedAt: null,
      }),
    );
    server.use(
      http.get(`${BASE_URL}/activity/migration-strava/jobs/job-id`, () =>
        HttpResponse.json(mockStore.getState().migration.job),
      ),
      http.get(`${BASE_URL}/activity/migration-strava/current`, () =>
        HttpResponse.json(mockStore.getState().migration.job),
      ),
    );

    await renderMigrationPage();

    expect(await screen.findByText(MIGRATION_STATES.english.waitingForServer)).toBeOnTheScreen();
    expect(screen.getByText('100%')).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByTestId('migration-error')).toBeNull());
    expect(screen.getByTestId('migration-cancel')).toBeOnTheScreen();
  });

  it('clears a stale transfer error once the server reports processing', async () => {
    const processingJob: ActivityMigrationJobResponse = {
      jobId: 'job-id',
      status: 'processing',
      uploadBytesReceived: 100,
      uploadBytesTotal: 100,
      queuePosition: null,
      queueAhead: 0,
      queueSize: 0,
      totalActivities: 10,
      processedActivities: 2,
      importedActivities: 2,
      skippedActivities: 0,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      finishedAt: null,
    };
    server.use(http.get(`${BASE_URL}/activity/migration-strava/jobs/job-id`, () => HttpResponse.json(processingJob)));
    mockStore.dispatch(setMigrationError('Ошибка передачи архива: Read timed out'));
    mockStore.dispatch(
      setMigrationJob({
        ...processingJob,
        status: 'uploading',
        totalActivities: 0,
        processedActivities: 0,
        importedActivities: 0,
      }),
    );

    await renderMigrationPage();

    expect(await screen.findByText(MIGRATION_STATES.english.processing)).toBeOnTheScreen();
    expect(screen.getByText('2/10')).toBeOnTheScreen();
    expect(screen.queryByTestId('migration-error')).toBeNull();
  });

  it('restores an active migration from the server when local state has no job id', async () => {
    const processingJob: ActivityMigrationJobResponse = {
      jobId: 'job-id',
      status: 'processing',
      uploadBytesReceived: 100,
      uploadBytesTotal: 100,
      queuePosition: null,
      queueAhead: 0,
      queueSize: 0,
      totalActivities: 10,
      processedActivities: 3,
      importedActivities: 3,
      skippedActivities: 0,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      finishedAt: null,
    };
    server.use(
      http.get(`${BASE_URL}/activity/migration-strava/current`, () => HttpResponse.json(processingJob)),
      http.get(`${BASE_URL}/activity/migration-strava/jobs/job-id`, () => HttpResponse.json(processingJob)),
    );

    await renderMigrationPage();

    expect(await screen.findByText(MIGRATION_STATES.english.processing)).toBeOnTheScreen();
    expect(screen.getByText('3/10')).toBeOnTheScreen();
    expect(mockStore.getState().migration.jobId).toBe('job-id');
  });

  it('shows the queue position while the archive is waiting for the worker', async () => {
    const user = userEvent.setup();
    await renderMigrationPage();
    await user.press(screen.getByTestId('migration-choose'));

    await act(async () => {
      latestMigrationArgs?.onArchiveUploadAccepted({
        jobId: 'job-id',
        status: 'queued',
        uploadBytesReceived: 0,
        uploadBytesTotal: 0,
        queuePosition: 3,
        queueAhead: 2,
        queueSize: 4,
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

    expect(await screen.findByText(MIGRATION_STATES.english.queueAhead(2, 3, 4))).toBeOnTheScreen();
  });

  it('stays on the migration page and allows another archive after processing completes', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/activity/migration-strava/jobs/job-id`, () =>
        HttpResponse.json({
          jobId: 'job-id',
          status: 'completed',
          uploadBytesReceived: 0,
          uploadBytesTotal: 0,
          totalActivities: 10,
          processedActivities: 10,
          importedActivities: 10,
          skippedActivities: 0,
          errorMessage: null,
          createdAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
        }),
      ),
    );
    await renderMigrationPage();
    await user.press(screen.getByTestId('migration-choose'));

    await act(async () => {
      latestMigrationArgs?.onArchiveUploadAccepted({
        jobId: 'job-id',
        status: 'queued',
        uploadBytesReceived: 0,
        uploadBytesTotal: 0,
        queuePosition: 1,
        queueAhead: 0,
        queueSize: 1,
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

    const chooseAnotherArchive = await screen.findByTestId('migration-choose');
    expect(mockReplace).not.toHaveBeenCalled();
    await user.press(chooseAnotherArchive);
    expect(mockMigrate).toHaveBeenCalledTimes(2);
  });

  it('renders each local archive-processing stage and an error state', async () => {
    const user = userEvent.setup();
    await renderMigrationPage();
    await user.press(screen.getByTestId('migration-choose'));
    const args = latestMigrationArgs!;

    await act(async () => {
      args.setIsDisabled(true);
      args.setIsUnzipping(true);
    });
    expect(screen.getByText(MIGRATION_STATES.english.unzipping)).toBeOnTheScreen();

    await act(async () => {
      args.setIsUnzipping(false);
      args.setIsRemovingMedia(true);
    });
    expect(screen.getByText(MIGRATION_STATES.english.remove)).toBeOnTheScreen();

    await act(async () => {
      args.setIsRemovingMedia(false);
      args.setIsZipping(true);
    });
    expect(screen.getByText(MIGRATION_STATES.english.zipping)).toBeOnTheScreen();

    await act(async () => {
      args.setIsZipping(false);
      args.setIsSendingArchive(true);
      args.setIsWaitingForServer(false);
    });
    expect(screen.getByText(MIGRATION_STATES.english.transfer)).toBeOnTheScreen();

    await act(async () => {
      args.setIsWaitingForServer(true);
    });
    expect(screen.getByText(MIGRATION_STATES.english.waitingForServer)).toBeOnTheScreen();

    await act(async () => {
      args.setIsSendingArchive(false);
      args.setIsWaitingForServer(false);
      args.setIsDeletingCacheFolder(true);
    });
    expect(screen.getByText(MIGRATION_STATES.english.cleaning)).toBeOnTheScreen();

    await act(async () => {
      args.setIsDeletingCacheFolder(false);
      args.setIsError('archive failed');
    });
    expect(screen.getByText(MIGRATION_STATES.english.error)).toBeOnTheScreen();
    expect(screen.queryByTestId('migration-choose')).toBeNull();
  });

  it('shows an explicit transfer error and closes it with the close button', async () => {
    const user = userEvent.setup();
    await renderMigrationPage();
    const errorMessage = 'Ошибка передачи архива: Сервер вернул статус 413';

    await act(async () => {
      mockStore.dispatch(setMigrationError(errorMessage));
    });

    expect(screen.getByTestId('migration-error')).toBeOnTheScreen();
    expect(screen.getByText(errorMessage)).toBeOnTheScreen();

    await user.press(screen.getByTestId('migration-error-close'));
    expect(screen.queryByText(errorMessage)).toBeNull();
    expect(mockStore.getState().migration.error).toBeNull();
    expect(screen.getByTestId('migration-choose')).toBeOnTheScreen();
    expect(screen.queryByTestId('migration-error')).toBeNull();
  });

  it('shows the archive size limit and feedback link', async () => {
    await renderMigrationPage();

    expect(screen.getByText(/archive size must not exceed 150 MB/)).toBeOnTheScreen();
    expect(screen.getByText(MIGRATION_STATES.english.feedbackLink)).toBeOnTheScreen();
  });

  it('renders Russian copy for the migration instructions', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderMigrationPage();

    expect(screen.getByText('Миграция из Strava')).toBeOnTheScreen();
    expect(screen.getByTestId('migration-choose')).toBeOnTheScreen();
  });
});
