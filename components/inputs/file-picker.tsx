/* eslint-disable no-console */
import { launchImageLibraryAsync } from 'expo-image-picker';

export async function pickImageAsync() {
  const result = await launchImageLibraryAsync({
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    console.log(result);
  } else {
    console.log('You did not select any image.');
  }
}
