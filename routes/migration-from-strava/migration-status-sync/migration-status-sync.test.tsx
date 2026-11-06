import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { setIsWaitingForServer } from '@R/slices/migration/migration';
import { MOCK_SERVER_MIGRATION_JOB } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import MigrationStatusSync from './migration-status-sync';

jest.mock('expo-router', () => ({ useIsFocused: () => true }));

describe('MigrationStatusSync', () => {
  it('saves a completed server job, clears waiting state, and refreshes activity statistics', async () => {
    await act(async () => {
      mockStore.dispatch(setIsWaitingForServer(true));
    });
    server.use(
      http.get(`${BASE_URL}/activity/migration-strava/current`, () => HttpResponse.json(MOCK_SERVER_MIGRATION_JOB)),
    );
    await renderWithProviders(<MigrationStatusSync />, { store: mockStore });

    await waitFor(() => expect(mockStore.getState().migration.job).toMatchObject(MOCK_SERVER_MIGRATION_JOB));
    expect(mockStore.getState().migration.jobId).toBe(MOCK_SERVER_MIGRATION_JOB.jobId);
    expect(mockStore.getState().migration.isWaitingForServer).toBe(false);
    expect(mockStore.getState().migration.error).toBeNull();
  });
});
