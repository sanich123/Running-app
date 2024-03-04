import { EXPIRED_TIME } from '@const/const';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Image as ImageCompressor, Video as VideoCompressor, getVideoMetaData } from 'react-native-compressor';

import { showCrossPlatformToast } from './custom-toast';
import { errorHandler } from './error-handler';
import { getBase64CodedImage, getSignedUrl, uploadPhoto } from '../auth/supabase/storage/upload-photo';

export async function compressAndSendFile(fileSrc: string, userId: string) {
  const splittedImg = fileSrc.split('.');
  const extension = splittedImg[splittedImg.length - 1];
  const isVideoFile = extension === ('mp4' || 'avi' || 'm4v');
  let compressedFile;
  if (isVideoFile) {
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
      const url = await getSignedUrl(pathToFile, EXPIRED_TIME);
      if (url) {
        if (isVideoFile) {
          const { uri } = await VideoThumbnails.getThumbnailAsync(url);
          return { url, thumbnail: uri };
        }
        return { url, thumbnail: null };
      }
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
