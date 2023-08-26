import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes } from 'firebase/storage';

import { errorHandler } from './error-handler';
import { EXT_MATCHER } from '../constants/regexp';
import { FIREBASE_STORAGE } from '../firebaseConfig';

export async function getBlobFromUri(uri: string) {
  try {
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      // eslint-disable-next-line node/handle-callback-err
      xhr.onerror = function (e) {
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  } catch (error) {
    errorHandler(error);
  }
}

export async function getAccessToGallery() {
  try {
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  } catch (error) {
    errorHandler(error);
  }
}

export function getInfoFromUri(uri: string) {
  const extension = (uri.match(EXT_MATCHER) || [])[1];
  return `images/img-${new Date().getTime()}.${extension}`;
}

export async function uploadToFirebaseStorage(fileName: string, blob: Blob) {
  const storageRef = ref(FIREBASE_STORAGE, fileName);
  return await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
}
