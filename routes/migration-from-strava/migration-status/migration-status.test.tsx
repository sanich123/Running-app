import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { MIGRATION_STATES } from '../const';
import MigrationStatus from './migration-status';
import type { MigrationViewState } from '../hooks';

const copy = MIGRATION_STATES[LANGUAGES.english];
const initialState: MigrationViewState = {
  isDisabled: false,
  isUnzipping: false,
  isRemovingMedia: false,
  isZipping: false,
  isSendingArchive: false,
  isWaitingForServer: false,
  isDeletingCacheFolder: false,
  uploadProgress: 0,
  jobId: null,
  job: null,
  error: null,
  dismissedError: null,
  isInitial: true,
  isProcessing: false,
  isServerCompleted: false,
  isServerFailed: false,
  isServerCancelled: false,
  isArchiveTransferActive: false,
  progress: 0,
  progressPercent: 0,
  uploadProgressPercent: 0,
};

describe('MigrationStatus', () => {
  it('starts archive selection from the initial state', async () => {
    const user = userEvent.setup();
    const onChooseArchive = jest.fn();

    await renderWithProviders(
      <MigrationStatus
        state={initialState}
        copy={copy}
        isProcessing={false}
        isCancelAvailable={false}
        isForegroundUploadSession={false}
        onChooseArchive={onChooseArchive}
        onCancel={jest.fn()}
        onDismissError={jest.fn()}
      />,
    );
    await user.press(screen.getByTestId('migration-choose'));

    expect(onChooseArchive).toHaveBeenCalledTimes(1);
  });

  it('offers cancellation during an active foreground upload', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    await renderWithProviders(
      <MigrationStatus
        state={{
          ...initialState,
          isInitial: false,
          isProcessing: true,
          isSendingArchive: true,
          isArchiveTransferActive: true,
        }}
        copy={copy}
        isProcessing
        isCancelAvailable
        isForegroundUploadSession
        onChooseArchive={jest.fn()}
        onCancel={onCancel}
        onDismissError={jest.fn()}
      />,
    );
    await user.press(screen.getByTestId('migration-cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
