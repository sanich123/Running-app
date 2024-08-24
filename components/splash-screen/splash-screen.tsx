// import Entypo from '@expo/vector-icons/Entypo';
// import * as Font from 'expo-font';
// import * as SplashScreen from 'expo-splash-screen';
// import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

// SplashScreen.preventAutoHideAsync();

export default function SplashIcon() {
  // const [appIsReady, setAppIsReady] = useState(false);

  // useEffect(() => {
  //   async function prepare() {
  //     try {
  //       await Font.loadAsync(Entypo.font);
  //     } catch (e) {
  //       console.warn(e);
  //     } finally {
  //       setAppIsReady(true);
  //     }
  //   }
  //   prepare();
  // }, []);

  // const onLayoutRootView = async () => {
  //   if (appIsReady) {
  //     // This tells the splash screen to hide immediately! If we call this after
  //     // `setAppIsReady`, then we may see a blank screen while the app is
  //     // loading its initial state and rendering its first pixels. So instead,
  //     // we hide the splash screen once we know the root view has already
  //     // performed layout.
  //     await SplashScreen.hideAsync();
  //   }
  // };

  // if (!appIsReady) {
  //   return null;
  // }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333' }}>
      <Text variant="headlineMedium" style={{ color: 'white' }}>
        Let's run!
      </Text>
    </View>
  );
}
