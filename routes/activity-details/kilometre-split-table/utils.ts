import { formatDurationMinsSecs } from '@U/time-formatter';
import type { ActivityKilometreSplit } from '@S/card/types';

export function getFastestSplitDuration(splits: ActivityKilometreSplit[]) {
  if (!splits.length) return 0;

  return Math.min(...splits.map(({ lastKilometerDuration }) => lastKilometerDuration));
}

export function getSplitMetric(split: ActivityKilometreSplit) {
  return formatDurationMinsSecs(split.lastKilometerDuration);
}

export function getSplitBarWidth(split: ActivityKilometreSplit, fastestSplitDuration: number) {
  if (!fastestSplitDuration || !split.lastKilometerDuration) return 0;

  return (fastestSplitDuration / split.lastKilometerDuration) * 100;
}

export function getColumnWidth(values: string[], minimumWidth: number) {
  const longestValueLength = values.reduce((longestLength, value) => Math.max(longestLength, value.length), 0);

  return Math.max(minimumWidth, longestValueLength * 9 + 8);
}
