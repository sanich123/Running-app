import * as ImagePicker from 'expo-image-picker';
import { errorToast } from '@S/error-toast/error-toast';
import { FILE_SENDING_ERROR_COPY } from './const';
import { MAX_VIDEO_DURATION_SECONDS } from './file-utils';

export async function getAccessToGallery(
  mediaTypes: ImagePicker.MediaType[] = ['images', 'videos'],
  options: Pick<ImagePicker.ImagePickerOptions, 'allowsMultipleSelection' | 'selectionLimit' | 'videoMaxDuration'> = {},
) {
  try {
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      aspect: [4, 3],
      quality: 1,
      videoMaxDuration: mediaTypes.includes('videos') ? MAX_VIDEO_DURATION_SECONDS : undefined,
      ...options,
    });
  } catch (error) {
    errorToast(FILE_SENDING_ERROR_COPY.galleryOpenFailed, error);
  }
}
