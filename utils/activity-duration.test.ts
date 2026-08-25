import { getCurrentActivityDuration } from './activity-duration';

describe('activity duration', () => {
  it('adds wall-clock time to the current active segment', () => {
    expect(
      getCurrentActivityDuration({ duration: 12_000, durationTimerBase: 10_000, durationTimerStartedAt: 1_000 }, 3_500),
    ).toBe(12_500);
  });

  it('keeps the synchronized value while the activity is paused', () => {
    expect(
      getCurrentActivityDuration({ duration: 12_000, durationTimerBase: 12_000, durationTimerStartedAt: null }),
    ).toBe(12_000);
  });

  it('does not produce a negative duration when the clock moves backwards', () => {
    expect(
      getCurrentActivityDuration({ duration: 0, durationTimerBase: 12_000, durationTimerStartedAt: 5_000 }, 4_000),
    ).toBe(12_000);
  });

  it('uses safe zero values when persisted duration fields are invalid', () => {
    expect(
      getCurrentActivityDuration(
        { duration: Number.NaN, durationTimerBase: Number.NaN, durationTimerStartedAt: Number.NaN },
        4_000,
      ),
    ).toBe(0);
  });
});
