import { RecordingView, useViewRecorder } from 'react-native-view-recorder';
import type { ReplayRecordOptions, ReplayRecordingViewProps, ReplayVideoRecorder } from './types';

export function useReplayVideoRecorder(): ReplayVideoRecorder {
  const recorder = useViewRecorder();

  return {
    sessionId: recorder.sessionId,
    isAvailable: true,
    record: (options: ReplayRecordOptions) => recorder.record(options),
  };
}

export function ReplayRecordingView({ children, sessionId }: ReplayRecordingViewProps) {
  return (
    <RecordingView sessionId={sessionId} style={{ flex: 1 }}>
      {children}
    </RecordingView>
  );
}
