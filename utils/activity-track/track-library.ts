import { Directory, File, Paths } from 'expo-file-system';
import { getDistance } from '@U/location/location-utils';
import { appStorage } from '@U/storage/storage';
import { encodeActivityLocationsAsFit } from './fit-encoder';
import type { ActivityLocation } from '@S/card/types';

const TRACKS_DIRECTORY_NAME = 'runich-tracks';
const TRACKS_INDEX_KEY = 'saved-activity-tracks:v1';
const trackLibraryListeners = new Set<() => void>();

export function subscribeToSavedActivityTracks(listener: () => void) {
  trackLibraryListeners.add(listener);
  return () => {
    trackLibraryListeners.delete(listener);
  };
}

function notifyTrackLibraryChanged() {
  trackLibraryListeners.forEach((listener) => listener());
}

export interface SavedActivityTrack {
  id: string;
  activityId: string;
  title: string;
  date: string;
  pointCount: number;
  distanceMeters?: number;
  sport?: string;
}

export type TrackFileFormat = 'gpx' | 'fit';

function getTracksDirectory() {
  return new Directory(Paths.document, TRACKS_DIRECTORY_NAME);
}

function getTrackFile(trackId: string, extension: 'json' | TrackFileFormat) {
  return new File(getTracksDirectory(), `${trackId}.${extension}`);
}

function getTrackDateParts(dateValue: string) {
  const date = new Date(dateValue);
  if (!Number.isFinite(date.getTime())) return { date: 'undated', time: '' };

  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`,
  };
}

function getTrackSportLabel(sport?: string) {
  const normalizedSport = sport?.trim().toLowerCase() ?? '';
  switch (normalizedSport) {
    case 'run':
    case 'running':
      return 'run';
    case 'hike':
    case 'hiking':
      return 'hike';
    case 'walk':
    case 'walking':
      return 'walk';
    case 'bike':
    case 'cycling':
    case 'cycle':
    case 'ride':
      return 'bike';
    case 'swim':
    case 'swimming':
      return 'swim';
    case 'workout':
    case 'gym':
      return 'workout';
    default:
      return normalizedSport.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'activity';
  }
}

export function getActivityTrackExportFilename(
  track: Pick<SavedActivityTrack, 'date' | 'sport'>,
  format: TrackFileFormat,
) {
  const { date, time } = getTrackDateParts(track.date);
  const timeSuffix = time ? `_${time}` : '';
  return `${date}_${getTrackSportLabel(track.sport)}${timeSuffix}.${format}`;
}

function getActivityTrackGpxTitle(track: SavedActivityTrack) {
  const { date, time } = getTrackDateParts(track.date);
  const timestamp = time ? ` ${time.replace(/-/g, ':')}` : '';
  return `${date} ${getTrackSportLabel(track.sport)}${timestamp} - ${track.title}`;
}

function readIndex(value: string | null): SavedActivityTrack[] {
  if (!value) return [];
  try {
    const tracks = JSON.parse(value) as SavedActivityTrack[];
    return Array.isArray(tracks)
      ? tracks.filter(
          (track) =>
            typeof track.id === 'string' &&
            typeof track.activityId === 'string' &&
            typeof track.title === 'string' &&
            typeof track.date === 'string' &&
            Number.isInteger(track.pointCount),
        )
      : [];
  } catch {
    return [];
  }
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' };
    return entities[character] ?? character;
  });
}

function getLocationTimestamp(location: ActivityLocation) {
  const timestamp = location.timestamp ?? location.coords.timestamp;
  return typeof timestamp === 'number' && Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}

export function encodeActivityLocationsAsGpx(title: string, locations: ActivityLocation[]) {
  const trackPoints = locations
    .filter(({ coords }) => Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude))
    .map((location) => {
      const { latitude, longitude, altitude } = location.coords;
      const timestamp = getLocationTimestamp(location);
      return `      <trkpt lat="${latitude}" lon="${longitude}">${typeof altitude === 'number' ? `<ele>${altitude}</ele>` : ''}${timestamp ? `<time>${timestamp}</time>` : ''}</trkpt>`;
    });
  if (trackPoints.length < 2) throw new Error('Для экспорта GPX нужно не менее двух точек маршрута');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="Runich" xmlns="http://www.topografix.com/GPX/1/1">',
    '  <trk>',
    `    <name>${escapeXml(title)}</name>`,
    '    <trkseg>',
    ...trackPoints,
    '    </trkseg>',
    '  </trk>',
    '</gpx>',
  ].join('\n');
}

export async function saveActivityTrack({
  activityId,
  title,
  date,
  sport,
  distanceMeters,
  locations,
}: {
  activityId: string;
  title: string;
  date: string;
  sport?: string;
  distanceMeters?: number;
  locations: ActivityLocation[];
}) {
  const validLocations = locations.filter(
    ({ coords }) => Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude),
  );
  if (validLocations.length < 2) throw new Error('Маршрут активности не содержит двух корректных точек');
  const calculatedDistance = validLocations.slice(1).reduce((distance, location, index) => {
    const previous = validLocations[index];
    return previous ? distance + getDistance(previous, location) : distance;
  }, 0);

  const directory = getTracksDirectory();
  directory.create({ idempotent: true, intermediates: true });
  const savedTrack: SavedActivityTrack = {
    id: `activity-${activityId}`,
    activityId,
    title: title.trim() || 'Активность Runich',
    date,
    pointCount: validLocations.length,
    distanceMeters: distanceMeters ?? calculatedDistance,
    ...(sport ? { sport } : {}),
  };
  const jsonFile = getTrackFile(savedTrack.id, 'json');
  const gpxFile = getTrackFile(savedTrack.id, 'gpx');
  const fitFile = getTrackFile(savedTrack.id, 'fit');
  jsonFile.create({ overwrite: true });
  gpxFile.create({ overwrite: true });
  fitFile.create({ overwrite: true });
  await Promise.all([
    jsonFile.write(JSON.stringify(validLocations)),
    gpxFile.write(encodeActivityLocationsAsGpx(getActivityTrackGpxTitle(savedTrack), validLocations)),
    fitFile.write(encodeActivityLocationsAsFit(validLocations, sport)),
  ]);

  const existingTracks = readIndex(await appStorage.getItem(TRACKS_INDEX_KEY));
  const updatedTracks = [savedTrack, ...existingTracks.filter(({ id }) => id !== savedTrack.id)];
  await appStorage.setItem(TRACKS_INDEX_KEY, JSON.stringify(updatedTracks));
  notifyTrackLibraryChanged();
  return savedTrack;
}

export async function listSavedActivityTracks() {
  const tracks = readIndex(await appStorage.getItem(TRACKS_INDEX_KEY));
  return tracks.filter(({ id }) => getTrackFile(id, 'json').exists);
}

export function getSavedActivityTracksStorageBytes() {
  return getTracksDirectory().size ?? 0;
}

export async function deleteAllSavedActivityTracks() {
  const directory = getTracksDirectory();
  if (directory.exists) directory.delete();
  await appStorage.setItem(TRACKS_INDEX_KEY, JSON.stringify([]));
  notifyTrackLibraryChanged();
  return [];
}

export async function readSavedActivityTrack(trackId: string) {
  const rawLocations: unknown = JSON.parse(await getTrackFile(trackId, 'json').text());
  if (!Array.isArray(rawLocations)) throw new Error('Не удалось прочитать сохранённый маршрут');
  return rawLocations.filter(
    (location): location is ActivityLocation =>
      Boolean(location) &&
      typeof location === 'object' &&
      'coords' in location &&
      typeof location.coords === 'object' &&
      location.coords !== null &&
      'latitude' in location.coords &&
      'longitude' in location.coords &&
      Number.isFinite(location.coords.latitude) &&
      Number.isFinite(location.coords.longitude),
  );
}

export async function getSavedActivityTrackFile(trackId: string, format: TrackFileFormat, exportFilename?: string) {
  const file = getTrackFile(trackId, format);
  if (!file.exists) throw new Error('Файл маршрута не найден на устройстве');
  if (exportFilename) {
    const exportFile = new File(Paths.cache, exportFilename);
    await file.copy(exportFile, { overwrite: true });
    return exportFile;
  }
  return file;
}

export async function renameSavedActivityTrack(trackId: string, title: string) {
  const updatedTitle = title.trim();
  if (!updatedTitle) throw new Error('Введите название маршрута');
  const tracks = readIndex(await appStorage.getItem(TRACKS_INDEX_KEY));
  const updatedTracks = tracks.map((track) => (track.id === trackId ? { ...track, title: updatedTitle } : track));
  await appStorage.setItem(TRACKS_INDEX_KEY, JSON.stringify(updatedTracks));
  notifyTrackLibraryChanged();
  return updatedTracks;
}

export async function deleteSavedActivityTrack(trackId: string) {
  for (const extension of ['json', 'gpx', 'fit'] as const) {
    const file = getTrackFile(trackId, extension);
    if (file.exists) file.delete();
  }
  const tracks = readIndex(await appStorage.getItem(TRACKS_INDEX_KEY));
  const updatedTracks = tracks.filter((track) => track.id !== trackId);
  await appStorage.setItem(TRACKS_INDEX_KEY, JSON.stringify(updatedTracks));
  notifyTrackLibraryChanged();
  return updatedTracks;
}
