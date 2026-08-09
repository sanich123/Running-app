import { decode, encode } from 'base64-arraybuffer';
import { File as ExpoFile } from 'expo-file-system';
import { Platform } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';
import { supabase } from '../supabase-init';

export async function getBase64CodedImage(file: string | File) {
  try {
    if (Platform.OS === 'web' && file instanceof File) {
      return file;
    } else {
      const bytes = await new ExpoFile(`${file}`).bytes();
      return encode(bytes.buffer as ArrayBuffer);
    }
  } catch (error) {
    errorToast('Не удалось обработать файл', error);
  }
}

export async function uploadPhoto(userId: string, base64: string | File, extension: string) {
  const filePath = `${userId}/${new Date().getTime()}.${extension}`;
  const contentType = ['mp4', 'avi', 'm4v'].includes(extension) ? 'video/mp4' : 'image/jpg';
  try {
    const { error, data: uploadedPhoto } = await supabase.storage
      .from('photos')
      .upload(filePath, base64 instanceof File ? base64 : decode(base64), { contentType });
    if (error) {
      errorToast('Не удалось загрузить файл', error);
    }
    if (uploadedPhoto) {
      return uploadedPhoto.path;
    }
  } catch (error) {
    errorToast('Не удалось загрузить файл', error);
  }
}

export async function getPublicUrl(path: string) {
  try {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data?.publicUrl;
  } catch (error) {
    errorToast('Не удалось получить ссылку на файл', error);
  }
}

function getPhotoStorageLocation(publicUrl: string) {
  const marker = '/storage/v1/object/';
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) return null;

  try {
    const [visibility, bucket, ...pathParts] = publicUrl.slice(markerIndex + marker.length).split('/');
    if (!visibility || !bucket || !pathParts.length) return null;

    return { bucket, path: decodeURIComponent(pathParts.join('/')) };
  } catch {
    const [visibility, bucket, ...pathParts] = publicUrl.slice(markerIndex + marker.length).split('/');
    if (!visibility || !bucket || !pathParts.length) return null;

    return { bucket, path: pathParts.join('/') };
  }
}

export async function removePhotos(publicUrls: string[]) {
  const locations = publicUrls.map(getPhotoStorageLocation).filter(
    (location): location is { bucket: string; path: string } => Boolean(location),
  );

  if (!locations.length) return true;

  try {
    const locationsByBucket = locations.reduce<Record<string, string[]>>((result, { bucket, path }) => {
      result[bucket] = [...(result[bucket] ?? []), path];
      return result;
    }, {});

    for (const [bucket, paths] of Object.entries(locationsByBucket)) {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) {
        errorToast('Не удалось удалить фото', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    errorToast('Не удалось удалить фото', error);
    return false;
  }
}
