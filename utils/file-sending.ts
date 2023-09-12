import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { ToastAndroid } from 'react-native';

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

export async function uploadToFirebaseStorage(
  fileName: string,
  blob: Blob,
  setProgressPercent: (arg: number) => void,
  setIsLoading: (arg: boolean) => void,
  setPhotoUrls: (arg: string[]) => void,
  photoUrls: string[],
) {
  const storageRef = ref(FIREBASE_STORAGE, fileName);
  const updateTask = uploadBytesResumable(storageRef, blob, { contentType: 'image/jpeg' });
  updateTask.on(
    'state_changed',
    ({ bytesTransferred, totalBytes }) => setProgressPercent(Number((bytesTransferred / totalBytes).toFixed(2))),
    (error) => console.log(error),
    async () => {
      setIsLoading(false);
      // ToastAndroid.show('File has successfully uploaded', ToastAndroid.SHORT);
      const url = await getDownloadURL(ref(FIREBASE_STORAGE, fileName));
      setPhotoUrls([...photoUrls, url]);
      // ToastAndroid.show('Url to file has successfully received', ToastAndroid.SHORT);
    },
  );
  return updateTask;
}
