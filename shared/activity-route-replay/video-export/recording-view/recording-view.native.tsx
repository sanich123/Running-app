import { RecordingView } from 'react-native-view-recorder';
import type { ReplayRecordingViewProps } from '../types';

export default function ReplayRecordingView({ children, sessionId }: ReplayRecordingViewProps) {
  return (
    <RecordingView sessionId={sessionId} style={{ flex: 1 }}>
      {children}
    </RecordingView>
  );
}
