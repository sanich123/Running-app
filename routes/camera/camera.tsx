import { useEffect, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import ChangeView from '@Routes/camera/change-view/change-view';
import CloseBtn from '@Routes/camera/close-btn/close-btn';
import FlashBtn from '@Routes/camera/flash-btn/flash-btn';
import ShotBtn from '@Routes/camera/shot-btn/shot-btn';
import PreviewImages from '@Routes/save-activity-page/preview-images/preview-images';
import { errorToast } from '@S/error-toast/error-toast';
import { CameraTypes, FlashModes } from './types';
import type { PhotoVideoType } from '@Routes/card/types';
import type { CameraType, FlashMode } from 'expo-camera';

export default function CameraLauncher() {
  const cameraRef = useRef<CameraView>(null);
  const [photos, setPhotos] = useState<PhotoVideoType[]>([]);
  const [type, setType] = useState<CameraType>(CameraTypes.back);
  const [flashEnable, setFlashEnable] = useState<FlashMode>(FlashModes.off);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    (async () => {
      try {
        await requestPermission();
        await MediaLibrary.requestPermissionsAsync();
      } catch (error) {
        errorToast('Не удалось получить доступ к камере и медиатеке', error);
      }
    })();
  }, [requestPermission]);

  return (
    <>
      {!permission && (
        <View style={styles.isLoadingView}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge">Getting your permission</Text>
        </View>
      )}
      {permission?.granted && (
        <CameraView ref={cameraRef} facing={type} style={{ flex: 1 }}>
          <CloseBtn />
          <View style={styles.controlsPreviewsLayout}>
            <View style={styles.previews}>
              <PreviewImages setImages={setPhotos} images={photos} isDisabled={false} />
            </View>
            <View style={styles.controls}>
              <FlashBtn setFlashEnable={setFlashEnable} flashEnable={flashEnable} />
              <ShotBtn cameraRef={cameraRef} setPhotos={setPhotos} photos={photos} />
              <ChangeView setType={setType} type={type} />
            </View>
          </View>
        </CameraView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  controls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  previews: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    gap: 5,
  },
  controlsPreviewsLayout: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  isLoadingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
