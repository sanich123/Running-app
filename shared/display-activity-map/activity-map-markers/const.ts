export type ActivityMapMarkerType = 'start' | 'end';

export const MARKER_CONFIG: Record<ActivityMapMarkerType, { icon: 'play' | 'stop'; testId: string }> = {
  start: { icon: 'play', testId: 'activity-map-start-marker' },
  end: { icon: 'stop', testId: 'activity-map-end-marker' },
};
