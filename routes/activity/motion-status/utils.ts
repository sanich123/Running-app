import type { MotionSource } from '@U/motion/types';

export function getMotionSourcesLabel(sources: MotionSource[], sourceLabels: Record<MotionSource, string>) {
  return sources.map((source) => sourceLabels[source]).join(', ');
}
