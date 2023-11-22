import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { MutableRefObject } from 'react';
import { Pressable } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

import { errorHandler } from '../../utils/error-handler';

type CameraShotBtnProps = {
  cameraRef: MutableRefObject<Camera>;
  setPhotos: (arg: string[]) => void;
  photos: string[];
};

export default function CameraShotBtn({ cameraRef, setPhotos, photos }: CameraShotBtnProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={async () => {
        try {
          const newPhoto = await cameraRef?.current.takePictureAsync({
            quality: 1,
            base64: true,
            exif: false,
          });
          setPhotos([...photos, newPhoto.uri]);
          MediaLibrary.saveToLibraryAsync(newPhoto.uri);
        } catch (error) {
          errorHandler(error);
        }
      }}>
      <Icon source="record-circle-outline" size={80} color={colors.primaryContainer} />
    </Pressable>
  );
}
