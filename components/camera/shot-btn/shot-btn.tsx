import { errorHandler } from '@U/error-handler';
import * as MediaLibrary from 'expo-media-library';
import { Icon, TouchableRipple, useTheme } from 'react-native-paper';

import { CAMERA_SETTINGS, ShotBtnProps } from '../const';

export default function ShotBtn({ cameraRef, setPhotos, photos }: ShotBtnProps) {
  const { colors, dark } = useTheme();

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
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
      }}>
      <Icon source="record-circle-outline" size={80} color={colors.primaryContainer} />
    </TouchableRipple>
  );
}
