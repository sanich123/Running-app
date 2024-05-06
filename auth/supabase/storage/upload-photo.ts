import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';

import { errorHandler } from '../../../utils/error-handler';
import { supabase } from '../supabase-init';

export async function getBase64CodedImage(file: string | File) {
  try {
    if (Platform.OS === 'web' && file instanceof File) {
      return file;
    } else {
      return await FileSystem.readAsStringAsync(`${file}`, { encoding: 'base64' });
    }
  } catch (error) {
    errorHandler(error);
  }
}

export async function uploadPhoto(userId: string, base64: string | File, extension: string) {
  const filePath = `${userId}/${new Date().getTime()}.${extension}`;
  const contentType = extension === ('mp4' || 'avi' || 'm4v') ? 'video/mp4' : 'image/jpg';
  try {
    const { error, data: uploadedPhoto } = await supabase.storage
      .from('photos')
      .upload(filePath, base64 instanceof File ? base64 : decode(base64), { contentType });
    if (error) {
      Alert.alert(error.message);
    }
    if (uploadedPhoto) {
      return uploadedPhoto.path;
    }
  } catch (error) {
    errorHandler(error);
  }
}

export async function getPublicUrl(path: string) {
  try {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data?.publicUrl;
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
    return data?.signedUrl;
  } catch (error) {
    errorHandler(error);
  }
}
