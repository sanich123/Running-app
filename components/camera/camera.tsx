import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';

export default function CameraLauncher({ setIsCameraVisible }: { setIsCameraVisible: (arg: boolean) => void }) {
  const cameraRef = useRef();
  // const [photo, setPhoto] = useState();
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const { height } = useWindowDimensions();
  useEffect(() => {
    (async () => {
      requestPermission();
      await MediaLibrary.requestPermissionsAsync();
    })();
  }, []);

  return (
    <View
      style={[
        {
          flex: 1,
          display: 'flex',
          height,
        },
        !permission && { justifyContent: 'center', alignItems: 'center' },
      ]}>
      {!permission && <ActivityIndicator size="small" />}
      {!permission?.granted && <Text>You have no permission..</Text>}
      {permission?.granted && (
        <Camera ref={cameraRef} type={type} style={styles.container}>
          <View>
            <Pressable onPress={() => setIsCameraVisible(false)}>
              <Icon source="close" size={50} color="white" />
            </Pressable>
            <Pressable
              onPress={() => setType((current) => (current === CameraType.back ? CameraType.front : CameraType.back))}>
              <Icon source="swap-horizontal-bold" size={50} color="white" />
            </Pressable>
          </View>
        </Camera>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
