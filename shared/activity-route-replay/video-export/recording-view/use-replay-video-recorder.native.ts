import { useViewRecorder } from 'react-native-view-recorder';
import type { ReplayRecordOptions, ReplayVideoRecorder } from '../types';

export default function useReplayVideoRecorder(): ReplayVideoRecorder {
  const recorder = useViewRecorder();

  return {
    sessionId: recorder.sessionId,
    isAvailable: true,
    record: (options: ReplayRecordOptions) => recorder.record(options),
  };
}
