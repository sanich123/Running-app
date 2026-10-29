import { Directory, File, Paths } from 'expo-file-system';
import { appStorage } from '@U/storage/storage';
import { encodeActivityLocationsAsFit } from './fit-encoder';
import type { ActivityLocation } from '@S/card/types';

const TRACKS_DIRECTORY_NAME = 'runich-tracks';
const TRACKS_INDEX_KEY = 'saved-activity-tracks:v1';

export interface SavedActivityTrack {
  id: string;
  activityId: string;
  title: string;
  date: string;
  pointCount: number;
}

type TrackFileFormat = 'gpx' | 'fit';

function getTracksDirectory() {
  return new Directory(Paths.document, TRACKS_DIRECTORY_NAME);
}

function getTrackFile(trackId: string, extension: 'json' | TrackFileFormat) {
  return new File(getTracksDirectory(), `${trackId}.${extension}`);
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
  locations,
}: {
  activityId: string;
  title: string;
  date: string;
  sport?: string;
  locations: ActivityLocation[];
}) {
  const validLocations = locations.filter(
    ({ coords }) => Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude),
  );
  if (validLocations.length < 2) throw new Error('Маршрут активности не содержит двух корректных точек');

  const directory = getTracksDirectory();
  directory.create({ idempotent: true, intermediates: true });
  const savedTrack: SavedActivityTrack = {
    id: `activity-${activityId}`,
    activityId,
    title: title.trim() || 'Активность Runich',
    date,
    pointCount: validLocations.length,
  };
  const jsonFile = getTrackFile(savedTrack.id, 'json');
  const gpxFile = getTrackFile(savedTrack.id, 'gpx');
  const fitFile = getTrackFile(savedTrack.id, 'fit');
  jsonFile.create({ overwrite: true });
  gpxFile.create({ overwrite: true });
  fitFile.create({ overwrite: true });
  await Promise.all([
    jsonFile.write(JSON.stringify(validLocations)),
    gpxFile.write(encodeActivityLocationsAsGpx(savedTrack.title, validLocations)),
    fitFile.write(encodeActivityLocationsAsFit(validLocations, sport)),
  ]);

  const existingTracks = readIndex(await appStorage.getItem(TRACKS_INDEX_KEY));
  const updatedTracks = [savedTrack, ...existingTracks.filter(({ id }) => id !== savedTrack.id)];
  await appStorage.setItem(TRACKS_INDEX_KEY, JSON.stringify(updatedTracks));
  return savedTrack;
}

export async function listSavedActivityTracks() {
  const tracks = readIndex(await appStorage.getItem(TRACKS_INDEX_KEY));
  return tracks.filter(({ id }) => getTrackFile(id, 'json').exists);
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

export async function getSavedActivityTrackFile(trackId: string, format: TrackFileFormat) {
  const file = getTrackFile(trackId, format);
  if (!file.exists) throw new Error('Файл маршрута не найден на устройстве');
  return file;
}

export async function renameSavedActivityTrack(trackId: string, title: string) {
  const updatedTitle = title.trim();
  if (!updatedTitle) throw new Error('Введите название маршрута');
  const tracks = readIndex(await appStorage.getItem(TRACKS_INDEX_KEY));
  const updatedTracks = tracks.map((track) => (track.id === trackId ? { ...track, title: updatedTitle } : track));
  await appStorage.setItem(TRACKS_INDEX_KEY, JSON.stringify(updatedTracks));
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
  return updatedTracks;
}
