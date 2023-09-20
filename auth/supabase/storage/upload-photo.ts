import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

import { errorHandler } from '../../../utils/error-handler';
import { supabase } from '../supabase-init';

export async function getBase64CodedImage(image: string) {
  try {
    return await FileSystem.readAsStringAsync(image, { encoding: 'base64' });
  } catch (error) {
    errorHandler(error);
  }
}

export async function getExtension(image: string) {
  const splittedImage = image.split('.');
  return splittedImage[splittedImage.length - 1];
}

export async function uploadPhoto(image: string, userId: string, base64: string) {
  const filePath = `${userId}/${new Date().getTime()}.jpg`;
  const contentType = 'image/jpg';
  try {
    const { error, data: uploadedPhoto } = await supabase.storage
      .from('avatars')
      .upload(filePath, decode(base64), { contentType, cacheControl: '1' });
    if (error) {
      Alert.alert(error.message);
      console.log(error);
    }
    return uploadedPhoto.path;
  } catch (error) {
    errorHandler(error);
  }
}

export async function getSignedUrl(path: string, expiredTime: number) {
  try {
    const { error, data } = await supabase.storage.from('avatars').createSignedUrl(path, expiredTime);
    if (error) {
      Alert.alert(error.message);
      console.log(error);
    }
    return data.signedUrl;
  } catch (error) {
    errorHandler(error);
  }
}
