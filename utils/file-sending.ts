import * as ImagePicker from 'expo-image-picker';
import { Image as ImageCompressor } from 'react-native-compressor';

import { errorHandler } from './error-handler';
import { getBase64CodedImage, uploadPhoto } from '../auth/supabase/storage/upload-photo';

export async function compressAndSendPhoto(imgSrc: string, userId: string) {
  const splittedImg = imgSrc.split('.');
  const extension = splittedImg[splittedImg.length - 1];
  const compressedImage = await ImageCompressor.compress(imgSrc);
  const base64 = await getBase64CodedImage(compressedImage);
  const pathToPhoto = await uploadPhoto(userId, base64, extension);
  return pathToPhoto;
}
export async function getAccessToGallery() {
  try {
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });
  } catch (error) {
    errorHandler(error);
  }
}
