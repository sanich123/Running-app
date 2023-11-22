import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions, Image } from 'react-native';
import { ActivityIndicator, Icon, Text, useTheme } from 'react-native-paper';

import CameraChangeView from '../camera-change-view/camera-change-view';
import CameraCloseBtn from '../camera-close/camera-close-btn';
import CameraShotBtn from '../camera-shot-btn/camera-shot-btn';
import PreviewImages from '../preview-images/preview-images';

export default function CameraLauncher({ setIsCameraVisible }: { setIsCameraVisible: (arg: boolean) => void }) {
  const cameraRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();

  useEffect(() => {
    (async () => {
      requestPermission();
      await MediaLibrary.requestPermissionsAsync();
    })();
  }, []);

  return (
    <>
      {!permission && <ActivityIndicator size="small" />}
      {!permission?.granted && <Text>You have no permission..</Text>}
      {permission?.granted && (
        <Camera ref={cameraRef} type={type} style={{ flex: 1, height: height - 50 }}>
          <View style={{ flex: 1, paddingBottom: 50 }}>
            <CameraCloseBtn setIsCameraVisible={setIsCameraVisible} />
            <View style={{ flex: 1, flexDirection: 'row', paddingLeft: 10, paddingRight: 10, gap: 5 }}>
              {/* {photos?.length > 0 &&
                photos.map((uri, index) => (
                  <View style={{ position: 'relative', zIndex: 0 }}>
                    <Pressable
                      key={`${uri}/${index}`}
                      style={{ position: 'absolute', zIndex: 5, top: 2, right: 2 }}
                      onPress={() => setPhotos(photos.filter((image) => image !== uri))}>
                      <MaterialCommunityIcons name="close-circle" color={colors.onPrimaryContainer} size={25} />
                    </Pressable>
                    <Image
                      style={{ zIndex: 0 }}
                      testID={`imagePreview-${index}`}
                      source={{ uri }}
                      width={width / 3 - 10}
                      height={100}
                      resizeMode="contain"
                    />
                  </View>
                ))} */}
              <PreviewImages setImages={setPhotos} images={photos} isDisabled={false} />
            </View>
            <View style={styles.controls}>
              <Pressable>
                <Icon source="content-save" size={50} color={colors.primaryContainer} />
              </Pressable>
              <CameraShotBtn cameraRef={cameraRef} setPhotos={setPhotos} photos={photos} />
              {/* <Pressable
                onPress={async () => {
                  try {
                    const newPhoto = await cameraRef?.current.takePictureAsync({
                      quality: 1,
                      base64: true,
                      exif: false,
                    });
                    setPhotos((photos) => [...photos, newPhoto.uri]);
                    MediaLibrary.saveToLibraryAsync(newPhoto.uri);
                  } catch (error) {
                    errorHandler(error);
                  }
                }}> */}
              {/* <Icon source="record-circle-outline" size={80} color={colors.primaryContainer} />
              </Pressable> */}
              {/* <Pressable
                onPress={() =>
                  setType((current) => (current === CameraType.back ? CameraType.front : CameraType.back))
                }>
                <Icon source="swap-horizontal-bold" size={50} color={colors.primaryContainer} />
              </Pressable> */}
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
    height: 100,
  },
});
