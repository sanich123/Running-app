import type { MapToolsProps } from '../types';

export function formatDurationOption(duration: number, copy: MapToolsProps['copy']) {
  return duration >= 60_000
    ? `${duration / 60_000}${copy.durationMinutesUnit ?? 'm'}`
    : `${duration / 1_000}${copy.durationSecondsUnit ?? 's'}`;
}
