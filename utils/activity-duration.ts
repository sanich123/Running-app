interface ActivityDurationState {
  duration: number;
  durationTimerBase: number;
  durationTimerStartedAt: number | null;
}

export function getCurrentActivityDuration(
  { duration, durationTimerBase, durationTimerStartedAt }: ActivityDurationState,
  now = Date.now(),
) {
  const safeDuration = Number.isFinite(duration) ? duration : 0;
  const safeTimerBase = Number.isFinite(durationTimerBase) ? durationTimerBase : safeDuration;

  if (typeof durationTimerStartedAt !== 'number' || !Number.isFinite(durationTimerStartedAt)) {
    return Math.max(0, safeDuration);
  }

  const elapsedSinceTimerStart = Math.max(0, now - durationTimerStartedAt);
  return Math.max(0, safeTimerBase + elapsedSinceTimerStart);
}
