import { STATUSES } from '@const/enums';
import { TRACKING_RECOVERY_INITIAL_STATE } from './const';
import reducer, { setTrackingRecoveryStartContext, startTrackingRecovery } from './tracking-recovery';

describe('tracking recovery start context', () => {
  it('persists the start instant and time zone before the first location point', () => {
    const started = reducer(TRACKING_RECOVERY_INITIAL_STATE, startTrackingRecovery('journal-1'));
    const next = reducer(
      started,
      setTrackingRecoveryStartContext({ startedAt: 1_757_600_000_000, timeZone: 'America/New_York' }),
    );

    expect(next).toMatchObject({
      journalId: 'journal-1',
      status: STATUSES.started,
      metrics: {
        recordingStartedAt: 1_757_600_000_000,
        recordingTimeZone: 'America/New_York',
      },
    });
  });
});
