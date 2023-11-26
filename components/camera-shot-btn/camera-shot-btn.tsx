import { errorHandler } from '@U/error-handler';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { MutableRefObject } from 'react';
import { Pressable } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

type CameraShotBtnProps = {
  cameraRef: MutableRefObject<Camera | null>;
  setPhotos: (arg: string[]) => void;
  photos: string[];
};

export default function CameraShotBtn({ cameraRef, setPhotos, photos }: CameraShotBtnProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={async () => {
        try {
          if (cameraRef?.current) {
            const newPhoto = await cameraRef?.current.takePictureAsync({
              quality: 1,
              base64: true,
              exif: false,
            });
            if (newPhoto) {
              setPhotos([...photos, newPhoto.uri]);
              MediaLibrary.saveToLibraryAsync(newPhoto.uri);
            }
          }
        } catch (error) {
          errorHandler(error);
        }
      }}>
      <Icon source="record-circle-outline" size={80} color={colors.primaryContainer} />
    </Pressable>
  );
}
