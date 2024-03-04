import CameraChangeView from '@C/camera-change-view/camera-change-view';
import CameraCloseBtn from '@C/camera-close/camera-close-btn';
import CameraFlash from '@C/camera-flash/camera-flash';
import CameraShotBtn from '@C/camera-shot-btn/camera-shot-btn';
import PreviewImages from '@C/preview-images/preview-images';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function CameraLauncher() {
  const cameraRef = useRef<Camera>(null);
  const [photos, setPhotos] = useState<{ url: string; thumbnail: string | null }[]>([]);
  const [type, setType] = useState(CameraType.back);
  const [flashEnable, setFlashEnable] = useState(FlashMode.off);
  const [permission, requestPermission] = Camera.useCameraPermissions();

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
        <Camera ref={cameraRef} type={type} flashMode={flashEnable} style={{ flex: 1 }}>
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
        </Camera>
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
