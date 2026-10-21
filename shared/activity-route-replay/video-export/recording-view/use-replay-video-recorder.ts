import type { ReplayVideoRecorder } from '../types';

export default function useReplayVideoRecorder(): ReplayVideoRecorder {
  return {
    sessionId: 'web-video-recording-unavailable',
    isAvailable: false,
    record: async () => {
      throw new Error('Route video export is available on native platforms only.');
    },
  };
}
