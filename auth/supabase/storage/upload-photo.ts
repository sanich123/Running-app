import { errorHandler } from '@u/error-handler';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

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

export async function uploadPhoto(userId: string, base64: string) {
  const filePath = `${userId}/${new Date().getTime()}.jpg`;
  const contentType = 'image/jpg';
  try {
    const { error, data: uploadedPhoto } = await supabase.storage
      .from('files')
      .upload(filePath, decode(base64), { contentType });
    if (error) {
      Alert.alert(error.message);
    }
    return uploadedPhoto.path;
  } catch (error) {
    errorHandler(error);
  }
}

export async function getPublicUrl(path: string) {
  try {
    const { data } = supabase.storage.from('files').getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    errorHandler(error);
  }
}

export async function getSignedUrl(path: string, expiredTime: number) {
  try {
    const { data, error } = await supabase.storage.from('files').createSignedUrl(path, expiredTime);
    if (error) {
      Alert.alert(error.message);
    }
    return data.signedUrl;
  } catch (error) {
    errorHandler(error);
  }
}
