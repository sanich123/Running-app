import { PhotoVideoType } from '../const ';

export type PhotoVideoUrls = PhotoVideoType[];

export type MediaListProps = {
  photoVideoUrls: PhotoVideoUrls;
  mapPhotoUrl?: string;
  mapPhotoUrlBlurhash?: string;
  id: string;
};
