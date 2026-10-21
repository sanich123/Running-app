import type { MutableRefObject } from 'react';
import type { ActivityPhoto } from '@R/slices/activity/types';
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
  setPhotos: (arg: ActivityPhoto[]) => void;
  photos: ActivityPhoto[];
  maxPhotos?: number;
  activityId?: string;
}

export interface CameraLauncherProps {
  photos?: ActivityPhoto[];
  setPhotos?: (arg: ActivityPhoto[]) => void;
  maxPhotos?: number;
  activityId?: string;
}
