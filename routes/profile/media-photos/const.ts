import { LANGUAGES } from '../../../constants/enums';

export const PROFILE_MEDIA = {
  [LANGUAGES.english]: {
    label: 'All photos',
    error: 'An error',
  },
  [LANGUAGES.russian]: {
    label: 'Все фото',
    error: 'Ошибка',
  },
} as const;

export function getSlicedPhotos(
  photos: {
    photoVideoUrls: { url: string; thumbnail: string | null; blurhash?: string };
  }[],
) {
  return photos
    ?.map(({ photoVideoUrls }) => photoVideoUrls)
    .flat()
    .slice(0, 4);
}
