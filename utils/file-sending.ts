import { EXPIRED_TIME } from '@const/const';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageCompressor, Video as VideoCompressor, getVideoMetaData } from 'react-native-compressor';

import { showCrossPlatformToast } from './custom-toast';
import { errorHandler } from './error-handler';
import { getBase64CodedImage, getSignedUrl, uploadPhoto } from '../auth/supabase/storage/upload-photo';

export async function compressAndSendFile(fileSrc: string, userId: string) {
  const splittedImg = fileSrc.split('.');
  const extension = splittedImg[splittedImg.length - 1];
  let compressedFile;
  if (extension === 'mp4') {
    compressedFile = await VideoCompressor.compress(fileSrc);
    const metaData = await getVideoMetaData(fileSrc);
    if (metaData.size > 4000) {
      showCrossPlatformToast('Файл слишком большой, размер файла не более 3 мб');
      return;
    }
  } else {
    compressedFile = await ImageCompressor.compress(fileSrc);
  }
  const base64 = await getBase64CodedImage(compressedFile);
  if (base64) {
    const pathToFile = await uploadPhoto(userId, base64, extension);
    if (pathToFile) {
      return await getSignedUrl(pathToFile, EXPIRED_TIME);
    }
  } else {
    return null;
  }
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
