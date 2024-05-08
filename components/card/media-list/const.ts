import { PhotoVideoType } from '../const ';

export type PhotoVideoUrls = PhotoVideoType[];

export type CardMapImagesListProps = {
  photoVideoUrls: PhotoVideoUrls;
  mapPhotoUrl?: string;
  mapPhotoUrlBlurhash?: string;
  id: string;
};
