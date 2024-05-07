import { PhotoVideoType } from '@C/card/const ';
import { errorHandler } from '@U/error-handler';
import { CameraView } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { MutableRefObject } from 'react';
import { Pressable } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

type CameraShotBtnProps = {
  cameraRef: MutableRefObject<CameraView | null>;
  setPhotos: (arg: PhotoVideoType[]) => void;
  photos: PhotoVideoType[];
};
const CAMERA_SETTINGS = {
  quality: 1,
  base64: true,
  exif: false,
};
export default function CameraShotBtn({ cameraRef, setPhotos, photos }: CameraShotBtnProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={async () => {
        try {
          if (cameraRef?.current) {
            const newPhoto = await cameraRef?.current.takePictureAsync(CAMERA_SETTINGS);
            if (newPhoto) {
              setPhotos([...photos, { url: newPhoto.uri, thumbnail: null }]);
              MediaLibrary.saveToLibraryAsync(newPhoto.uri);
            }
          }
        } catch (error) {
          errorHandler(error);
        }
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <Icon source="record-circle-outline" size={80} color={colors.primaryContainer} />
    </Pressable>
  );
}
