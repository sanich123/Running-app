import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Platform } from 'react-native';
import { Image as ImageCompressor, Video as VideoCompressor, getVideoMetaData } from 'react-native-compressor';

import { showCrossPlatformToast } from './custom-toast';
import { errorHandler } from './error-handler';
import { getBase64CodedImage, getPublicUrl, uploadPhoto } from '../auth/supabase/storage/upload-photo';

export async function compressAndSendFile(
  fileSrc: string | File,
  userId: string,
): Promise<{ url: string; thumbnail: string | null } | null | undefined> {
  const splittedImg = fileSrc instanceof File ? fileSrc.name.split('.') : fileSrc.split('.');
  const extension = splittedImg[splittedImg.length - 1];
  const isVideoFile = extension === ('mp4' || 'avi' || 'm4v');

  const compressedFile = await compressImageOrVideo(fileSrc, extension);
  if (compressedFile) {
    const encodedFile = await getBase64CodedImage(compressedFile);
    if (encodedFile) {
      const pathToFile = await uploadPhoto(userId, encodedFile, extension);
      if (pathToFile) {
        const url = await getPublicUrl(pathToFile);
        if (url) {
          if (isVideoFile) {
            const { uri } = await VideoThumbnails.getThumbnailAsync(url);
            const uploadedImage = await compressAndSendFile(uri, userId);
            if (uploadedImage) {
              const { url: thumbnailUrl } = uploadedImage;
              return { url, thumbnail: thumbnailUrl };
            }
          } else {
            return { url, thumbnail: null };
          }
        }
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

export async function compressImageOrVideo(fileSrc: string | File, extension: string) {
  const MAX_VIDEO_SIZE = 15000;
  const supportedImagesExtensions = /webp|png|avif|heic|jpeg|gif|svg|ico|jpg/;
  const isVideoFile = extension === ('mp4' || 'avi' || 'm4v');
  if (isVideoFile) {
    try {
      const metaData = await getVideoMetaData(`${fileSrc}`);
      if (metaData.size > MAX_VIDEO_SIZE) {
        showCrossPlatformToast('Файл слишком большой, размер файла не более 15 мб');
        return null;
      } else {
        return await VideoCompressor.compress(`${fileSrc}`);
      }
    } catch {
      showCrossPlatformToast('Ошибка во время сжатия видео');
    }
  } else {
    try {
      if (Platform.OS === 'web') {
        return fileSrc;
      }
      if (supportedImagesExtensions.test(extension)) {
        return await ImageCompressor.compress(`${fileSrc}`);
      } else {
        showCrossPlatformToast('Такое разрешение нельзя использовать для изображения');
      }
    } catch {
      showCrossPlatformToast('Ошибка во время сжатия изображения');
    }
  }
}
