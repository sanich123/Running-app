import CameraChangeView from '@C/camera-change-view/camera-change-view';
import CameraCloseBtn from '@C/camera-close/camera-close-btn';
import CameraFlash from '@C/camera-flash/camera-flash';
import CameraShotBtn from '@C/camera-shot-btn/camera-shot-btn';
import { PhotoVideoType } from '@C/card/const ';
import PreviewImages from '@C/preview-images/preview-images';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function CameraLauncher() {
  const cameraRef = useRef<CameraView>(null);
  const [photos, setPhotos] = useState<PhotoVideoType[]>([]);
  const [type, setType] = useState('back' as CameraType);
  const [flashEnable, setFlashEnable] = useState('off' as FlashMode);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    (async () => {
      requestPermission();
      await MediaLibrary.requestPermissionsAsync();
    })();
  }, []);

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
          <CameraCloseBtn />
          <View style={styles.controlsPreviewsLayout}>
            <View style={styles.previews}>
              <PreviewImages setImages={setPhotos} images={photos} isDisabled={false} />
            </View>
            <View style={styles.controls}>
              <CameraFlash setFlashEnable={setFlashEnable} flashEnable={flashEnable} />
              <CameraShotBtn cameraRef={cameraRef} setPhotos={setPhotos} photos={photos} />
              <CameraChangeView setType={setType} type={type} />
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
