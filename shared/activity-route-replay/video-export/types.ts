import type { ReactNode } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import type { ReplayCopy } from '../types';

export interface ReplayRecordFrame {
  frameIndex: number;
  totalFrames: number;
}

export interface ReplayRecordOptions {
  output: string;
  fps: number;
  totalFrames: number;
  width: number;
  height: number;
  codec: 'h264';
  bitrate: number;
  optimizeForNetwork: true;
  onFrame: (frame: ReplayRecordFrame) => void;
}

export interface ReplayVideoRecorder {
  sessionId: string;
  isAvailable: boolean;
  record: (options: ReplayRecordOptions) => Promise<string>;
}

export interface ReplayExportPlayback {
  progress: number;
  hasStarted: boolean;
  isPlaying: boolean;
  playbackDuration: number;
  prepareVideoRecording: () => void;
  setVideoFrameProgress: (progress: number, frameDurationMs: number) => void;
  restoreAfterVideoRecording: (progress: number, hasStarted: boolean, isPlaying: boolean) => void;
}

export interface ReplayVideoExportOptions {
  playback: ReplayExportPlayback;
  copy: Pick<ReplayCopy, 'cancel' | 'share' | 'shareUnavailable' | 'shareVideo' | 'videoReady' | 'videoSize'>;
  workoutDate?: string;
}

export interface ReplayVideoExportState {
  isExporting: boolean;
  recorder: ReplayVideoRecorder;
  onLayout: (event: LayoutChangeEvent) => void;
  shareVideo: () => Promise<void>;
}

export interface ReplayRecordingViewProps {
  children: ReactNode;
  sessionId: string;
}
