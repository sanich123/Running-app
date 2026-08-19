import { VIDEO_EXTENSIONS } from './const';

export function getPhotoUrl(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return '';
  }

  if (/^(?:https?|data|blob):\/\//i.test(rawValue) || /^data:/i.test(rawValue)) {
    return rawValue;
  }

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

export function isVideoUrl(url: string) {
  const pathname = url.split('?')[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((extension) => pathname.endsWith(`.${extension}`));
}
