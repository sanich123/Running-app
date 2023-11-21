import { Camera, CameraType } from 'expo-camera';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function CameraLauncher() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  //   if (!permission) ...

  //   if (!permission.granted) ...

  function toggleCameraType() {
    setType((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
  }
  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <View style={{ width: 50 }}>
      {permission && (
        <Camera type={type}>
          <View style={{ width: 50 }}>
            <TouchableOpacity onPress={toggleCameraType}>
              <Text>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      )}
    </View>
  );
}
