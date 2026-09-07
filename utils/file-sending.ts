import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Image as ImageCompressor, Video as VideoCompressor, getVideoMetaData } from 'react-native-compressor';
import { Platform } from 'react-native';
import { photosApi, type UploadedPhotoResponse } from '@R/services/photos/photos';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';

export type SendPhoto = (body: FormData) => Promise<UploadedPhotoResponse>;

export async function compressAndSendFile(
  fileSrc: string | File,
  userId: string,
  sendPhoto: SendPhoto = uploadPhotoToServer,
): Promise<{ url: string; thumbnail: string | null } | null | undefined> {
  const sourceName = typeof fileSrc === 'string' ? fileSrc : fileSrc.name;
  const extension = getFileExtension(sourceName);
  const isVideoFile = ['mp4', 'avi', 'm4v'].includes(extension);

  const compressedFile = await compressImageOrVideo(fileSrc, extension);
  if (compressedFile) {
    const uploadedPhoto = await sendPhoto(createUploadFormData(compressedFile, fileSrc, extension, isVideoFile));
    if (uploadedPhoto) {
      if (isVideoFile) {
        const { uri } = await VideoThumbnails.getThumbnailAsync(uploadedPhoto.url);
        const uploadedImage = await compressAndSendFile(uri, userId, sendPhoto);
        if (uploadedImage) return { url: uploadedPhoto.url, thumbnail: uploadedImage.url };
      } else {
        return { url: uploadedPhoto.url, thumbnail: null };
      }
    }
  } else {
    return null;
  }
}

export async function uploadPhotoToServer(body: FormData) {
  return await store.dispatch(photosApi.endpoints.uploadPhoto.initiate(body)).unwrap();
}

export async function deletePhotos(publicUrls: string[]) {
  for (const url of publicUrls) {
    await store.dispatch(photosApi.endpoints.deletePhoto.initiate({ url })).unwrap();
  }
  return true;
}

function createUploadFormData(file: string | File, originalFile: string | File, extension: string, isVideo: boolean) {
  const formData = new FormData();
  const isBrowserFile = typeof file !== 'string';
  const originalName = typeof originalFile === 'string' ? originalFile : originalFile.name;
  const uploadFile = isBrowserFile
    ? file
    : {
        uri: String(file),
        name: originalName || `runich-${Date.now()}.${isVideo ? 'mp4' : extension || 'jpg'}`,
        type: isVideo ? 'video/mp4' : 'image/jpeg',
      };
  formData.append('file', uploadFile as never);
  return formData;
}

export async function getAccessToGallery() {
  try {
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      aspect: [4, 3],
      quality: 1,
    });
  } catch (error) {
    errorToast('Не удалось открыть галерею', error);
  }
}

async function compressImageOrVideo(fileSrc: string | File, extension: string) {
  const MAX_VIDEO_SIZE = 15000;
  const supportedImagesExtensions = /^(webp|png|avif|heic|jpeg|gif|svg|ico|jpg)$/;
  const isVideoFile = ['mp4', 'avi', 'm4v'].includes(extension);
  if (isVideoFile) {
    try {
      const metaData = await getVideoMetaData(`${fileSrc}`);
      if (metaData.size > MAX_VIDEO_SIZE) {
        errorToast('Файл слишком большой, размер файла не более 15 МБ');
        return null;
      } else {
        return await VideoCompressor.compress(`${fileSrc}`);
      }
    } catch (error) {
      errorToast('Ошибка во время сжатия видео', error);
    }
  } else {
    try {
      if (Platform.OS === 'web') {
        return fileSrc;
      }
      if (supportedImagesExtensions.test(extension)) {
        return await ImageCompressor.compress(`${fileSrc}`);
      } else {
        errorToast('Такое разрешение нельзя использовать для изображения');
      }
    } catch (error) {
      errorToast('Ошибка во время сжатия изображения', error);
    }
  }
}

function getFileExtension(fileName: string) {
  const cleanName = fileName.split(/[?#]/, 1)[0];
  return cleanName.split('.').at(-1)?.toLowerCase() ?? '';
}
