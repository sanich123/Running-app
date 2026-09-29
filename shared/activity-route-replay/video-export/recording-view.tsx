import { View } from 'react-native';
import type { ReplayRecordingViewProps, ReplayVideoRecorder } from './types';

export function useReplayVideoRecorder(): ReplayVideoRecorder {
  return {
    sessionId: 'web-video-recording-unavailable',
    isAvailable: false,
    record: async () => {
      throw new Error('Route video export is available on native platforms only.');
    },
  };
}

export function ReplayRecordingView({ children }: ReplayRecordingViewProps) {
  return <View style={{ flex: 1 }}>{children}</View>;
}
