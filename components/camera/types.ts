import { PhotoVideoType } from '@C/card/types';
import { CameraType, CameraView, FlashMode } from 'expo-camera';
import { MutableRefObject } from 'react';

export enum CameraTypes {
  back = 'back',
  front = 'front',
}

export enum FlashModes {
  off = 'off',
  on = 'on',
  auto = 'auto',
}

export type ChangeViewProps = {
  type: CameraType;
  setType: (arg: CameraType) => void;
};

export type FlashBtnProps = {
  setFlashEnable: (arg: FlashMode) => void;
  flashEnable: FlashMode;
};

export type ShotBtnProps = {
  cameraRef: MutableRefObject<CameraView | null>;
  setPhotos: (arg: PhotoVideoType[]) => void;
  photos: PhotoVideoType[];
};
