import type { MutableRefObject } from 'react';
import type { PhotoVideoType } from '@C/card/types';
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
  setPhotos: (arg: PhotoVideoType[]) => void;
  photos: PhotoVideoType[];
}
