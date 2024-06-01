import { PhotoVideoType } from '@C/card/const ';
import { CameraView } from 'expo-camera';
import { MutableRefObject } from 'react';

export type ShotBtnProps = {
  cameraRef: MutableRefObject<CameraView | null>;
  setPhotos: (arg: PhotoVideoType[]) => void;
  photos: PhotoVideoType[];
};

export const CAMERA_SETTINGS = {
  quality: 1,
  base64: true,
  exif: false,
};
