import { ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_DIMENSION_PX } from '../const';

export function getReplayVideoSize(width: number, height: number, pixelRatio: number) {
  const pixelWidth = width * pixelRatio;
  const pixelHeight = height * pixelRatio;
  const scale = Math.min(1, ACTIVITY_ROUTE_REPLAY_EXPORT_MAX_DIMENSION_PX / Math.max(pixelWidth, pixelHeight));
  const toEvenSize = (size: number) => Math.max(2, Math.floor((size * scale) / 2) * 2);

  return {
    width: toEvenSize(pixelWidth),
    height: toEvenSize(pixelHeight),
  };
}

export function getReplayVideoPath(uri: string) {
  return decodeURIComponent(uri.replace(/^file:\/\//, ''));
}

export function getReplayVideoUri(path: string) {
  return path.startsWith('file://') ? path : `file://${path}`;
}

export function getReplayVideoFilename(workoutDate?: string) {
  const parsedDate = workoutDate ? new Date(workoutDate) : new Date();
  const date = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const pad = (value: number) => String(value).padStart(2, '0');
  const dateTime = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}.${pad(date.getMinutes())}.${pad(date.getSeconds())}`;

  return `${dateTime}.mp4`;
}

export function formatReplayVideoSize(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;

  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}
