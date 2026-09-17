import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Image as ImageCompressor, Video as VideoCompressor, getVideoMetaData } from 'react-native-compressor';
import { Platform } from 'react-native';
import { photosApi, type UploadedPhotoResponse } from '@R/services/photos/photos';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';
import {
  MAX_MEDIA_FILE_SIZE,
  createMediaUploadFormData,
  getMediaFileInfo,
  isSupportedImageExtension,
} from './file-sending/file-utils';
import type { CompressedMediaFile, MediaSource, MediaUploadOptions } from './file-sending/file-sending-types';

export type { CompressedMediaFile, MediaSource, MediaUploadOptions } from './file-sending/file-sending-types';

export type UploadMediaRequest = (body: FormData) => Promise<UploadedPhotoResponse>;

export async function compressMediaFile(fileSrc: MediaSource): Promise<CompressedMediaFile | null> {
  const { fileName, extension, isVideo } = getMediaFileInfo(fileSrc);

  if (!isVideo && !isSupportedImageExtension(extension)) {
    errorToast('Такое разрешение нельзя использовать для изображения');
    return null;
  }

  try {
    const compressedFile = isVideo ? await compressVideo(fileSrc) : await compressImage(fileSrc);
    if (!compressedFile) return null;

    return {
      file: compressedFile,
      originalName: fileName,
      extension,
      isVideo,
    };
  } catch (error) {
    errorToast(isVideo ? 'Ошибка во время сжатия видео' : 'Ошибка во время сжатия изображения', error);
    return null;
  }
}

export async function uploadMediaFile(
  compressedFile: CompressedMediaFile,
  uploadOptions: MediaUploadOptions = { scope: 'activity' },
  uploadRequest: UploadMediaRequest = uploadMediaToServer,
): Promise<UploadedPhotoResponse | null> {
  try {
    const formData = createMediaUploadFormData({
      file: compressedFile.file,
      originalName: compressedFile.originalName,
      extension: compressedFile.extension,
      isVideo: compressedFile.isVideo,
      uploadOptions,
    });
    return (await uploadRequest(formData)) ?? null;
  } catch (error) {
    errorToast('Не удалось загрузить медиафайл', error);
    return null;
  }
}

export async function createVideoThumbnail(videoUrl: string): Promise<string | null> {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl);
    return uri;
  } catch (error) {
    errorToast('Не удалось создать превью видео', error);
    return null;
  }
}

export async function getAccessToGallery(mediaTypes: ImagePicker.MediaType[] = ['images', 'videos']) {
  try {
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      aspect: [4, 3],
      quality: 1,
    });
  } catch (error) {
    errorToast('Не удалось открыть галерею', error);
  }
}

export async function deleteUploadedMedia(publicUrls: string[]) {
  try {
    for (const url of publicUrls) {
      await store.dispatch(photosApi.endpoints.deletePhoto.initiate({ url })).unwrap();
    }
    return true;
  } catch (error) {
    errorToast('Не удалось удалить медиафайл', error);
    return false;
  }
}

async function compressVideo(fileSrc: MediaSource): Promise<MediaSource | null> {
  if (Platform.OS === 'web') {
    if (typeof fileSrc !== 'string' && fileSrc.size > MAX_MEDIA_FILE_SIZE) {
      errorToast('Файл слишком большой, размер файла не более 15 МБ');
      return null;
    }
    return fileSrc;
  }

  const metaData = await getVideoMetaData(String(fileSrc));
  if (metaData.size > MAX_MEDIA_FILE_SIZE) {
    errorToast('Файл слишком большой, размер файла не более 15 МБ');
    return null;
  }

  return await VideoCompressor.compress(String(fileSrc));
}

async function compressImage(fileSrc: MediaSource): Promise<MediaSource> {
  if (Platform.OS === 'web') return fileSrc;
  return await ImageCompressor.compress(String(fileSrc));
}

async function uploadMediaToServer(body: FormData) {
  return await store.dispatch(photosApi.endpoints.uploadPhoto.initiate(body)).unwrap();
}
