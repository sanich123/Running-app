import { View } from 'react-native';
import type { ReplayRecordingViewProps } from '../types';

export default function ReplayRecordingView({ children }: ReplayRecordingViewProps) {
  return <View style={{ flex: 1 }}>{children}</View>;
}
