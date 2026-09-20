import type { MutableRefObject } from 'react';
import type { ActivityMediaItem } from '@S/card/types';
import type { CameraType, CameraView, FlashMode } from 'expo-camera';

export enum CameraTypes {
  back = 'back',
  front = 'front',
}

export enum FlashModes {
  off = 'off',
  on = 'on',
  auto = 'auto',
}

export interface ChangeViewProps {
  type: CameraType;
  setType: (arg: CameraType) => void;
}

export interface FlashBtnProps {
  setFlashEnable: (arg: FlashMode) => void;
  flashEnable: FlashMode;
}

export interface ShotBtnProps {
  cameraRef: MutableRefObject<CameraView | null>;
  setPhotos: (arg: ActivityMediaItem[]) => void;
  photos: ActivityMediaItem[];
  maxPhotos?: number;
}

export interface CameraLauncherProps {
  photos?: ActivityMediaItem[];
  setPhotos?: (arg: ActivityMediaItem[]) => void;
  maxPhotos?: number;
}
