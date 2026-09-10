import { createMMKV } from 'react-native-mmkv';
import type { LocationObject } from 'expo-location';

const LOCATION_JOURNAL_VERSION = 1;
const LOCATION_JOURNAL_STORAGE_ID = 'runich-location-journal';
const LOCATION_CHUNK_SIZE = 32;
const ACTIVE_JOURNAL_KEY = 'active-journal-id';

const storage = createMMKV({ id: LOCATION_JOURNAL_STORAGE_ID });

type CompactLocation = [
  latitude: number,
  longitude: number,
  timestamp: number,
  altitude: number | null,
  altitudeAccuracy: number | null,
  accuracy: number | null,
  heading: number | null,
  speed: number | null,
  mocked: boolean,
];

interface LocationJournalMeta {
  version: typeof LOCATION_JOURNAL_VERSION;
  pointCount: number;
  chunkCount: number;
  segmentStarts: number[];
}

export interface LocationJournalSnapshot {
  locations: LocationObject[];
  segments: LocationObject[][];
  pointCount: number;
}

export interface LocationJournalProgress {
  pointCount: number;
  lastTimestamp: number | null;
}

function getMetaKey(journalId: string) {
  return `${journalId}:meta`;
}

function getChunkKey(journalId: string, chunkIndex: number) {
  return `${journalId}:chunk:${chunkIndex}`;
}

function createJournalId() {
  return `tracking-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getCoordinates(location: LocationObject) {
  const coords = location.coords as LocationObject['coords'] & { timestamp?: number; mocked?: boolean };
  return coords;
}

function toCompactLocation(location: LocationObject): CompactLocation {
  const coords = getCoordinates(location);
  return [
    coords.latitude,
    coords.longitude,
    location.timestamp ?? coords.timestamp ?? Date.now(),
    coords.altitude ?? null,
    coords.altitudeAccuracy ?? null,
    coords.accuracy ?? null,
    coords.heading ?? null,
    coords.speed ?? null,
    location.mocked === true || coords.mocked === true,
  ];
}

function fromCompactLocation([
  latitude,
  longitude,
  timestamp,
  altitude,
  altitudeAccuracy,
  accuracy,
  heading,
  speed,
  mocked,
]: CompactLocation): LocationObject {
  return {
    timestamp,
    coords: {
      latitude,
      longitude,
      ...(altitude === null ? {} : { altitude }),
      ...(altitudeAccuracy === null ? {} : { altitudeAccuracy }),
      ...(accuracy === null ? {} : { accuracy }),
      ...(heading === null ? {} : { heading }),
      ...(speed === null ? {} : { speed }),
      ...(mocked ? { mocked: true } : {}),
    },
  } as LocationObject;
}

function readMeta(journalId: string): LocationJournalMeta | null {
  const rawMeta = storage.getString(getMetaKey(journalId));
  if (!rawMeta) return null;

  try {
    const meta = JSON.parse(rawMeta) as LocationJournalMeta;
    if (
      meta.version !== LOCATION_JOURNAL_VERSION ||
      !Number.isInteger(meta.pointCount) ||
      !Number.isInteger(meta.chunkCount) ||
      !Array.isArray(meta.segmentStarts)
    ) {
      return null;
    }
    return meta;
  } catch {
    return null;
  }
}

function writeMeta(journalId: string, meta: LocationJournalMeta) {
  storage.set(getMetaKey(journalId), JSON.stringify(meta));
}

function readChunk(journalId: string, chunkIndex: number): CompactLocation[] {
  const rawChunk = storage.getString(getChunkKey(journalId, chunkIndex));
  if (!rawChunk) return [];

  try {
    const chunk = JSON.parse(rawChunk) as CompactLocation[];
    return Array.isArray(chunk) ? chunk : [];
  } catch {
    return [];
  }
}

export function createLocationJournal() {
  const journalId = createJournalId();
  writeMeta(journalId, {
    version: LOCATION_JOURNAL_VERSION,
    pointCount: 0,
    chunkCount: 0,
    segmentStarts: [0],
  });
  storage.set(ACTIVE_JOURNAL_KEY, journalId);
  return journalId;
}

export function getActiveLocationJournalId() {
  return storage.getString(ACTIVE_JOURNAL_KEY) ?? null;
}

export function appendLocationToJournal(journalId: string, location: LocationObject) {
  const meta = readMeta(journalId);
  if (!meta) return false;

  const lastTimestamp = meta.pointCount > 0 ? readChunk(journalId, meta.chunkCount - 1).at(-1)?.[2] : undefined;
  const timestamp = location.timestamp ?? getCoordinates(location).timestamp;
  if (typeof lastTimestamp === 'number' && typeof timestamp === 'number' && timestamp <= lastTimestamp) return false;

  const chunkIndex = Math.floor(meta.pointCount / LOCATION_CHUNK_SIZE);
  const chunk = readChunk(journalId, chunkIndex);
  chunk.push(toCompactLocation(location));
  storage.set(getChunkKey(journalId, chunkIndex), JSON.stringify(chunk));

  writeMeta(journalId, {
    ...meta,
    pointCount: meta.pointCount + 1,
    chunkCount: Math.max(meta.chunkCount, chunkIndex + 1),
  });
  return true;
}

export function getLocationJournalProgress(journalId: string): LocationJournalProgress | null {
  const meta = readMeta(journalId);
  if (!meta) return null;

  const lastTimestamp = meta.pointCount > 0 ? readChunk(journalId, meta.chunkCount - 1).at(-1)?.[2] : null;
  return { pointCount: meta.pointCount, lastTimestamp: typeof lastTimestamp === 'number' ? lastTimestamp : null };
}

export function markLocationJournalPause(journalId: string) {
  const meta = readMeta(journalId);
  if (!meta || meta.segmentStarts.at(-1) === meta.pointCount) return;

  writeMeta(journalId, { ...meta, segmentStarts: [...meta.segmentStarts, meta.pointCount] });
}

export function readLocationJournal(journalId: string): LocationJournalSnapshot | null {
  const meta = readMeta(journalId);
  if (!meta) return null;

  const locations = Array.from({ length: meta.chunkCount }, (_, chunkIndex) =>
    readChunk(journalId, chunkIndex).map(fromCompactLocation),
  ).flat();
  const segmentStarts = [...meta.segmentStarts, locations.length];
  const segments = segmentStarts.slice(0, -1).map((start, index) => locations.slice(start, segmentStarts[index + 1]));

  return { locations, segments: segments.length ? segments : [[]], pointCount: meta.pointCount };
}

export function removeLocationJournal(journalId: string) {
  const meta = readMeta(journalId);
  if (meta) {
    for (let chunkIndex = 0; chunkIndex < meta.chunkCount; chunkIndex += 1) {
      storage.remove(getChunkKey(journalId, chunkIndex));
    }
  }
  storage.remove(getMetaKey(journalId));
  if (getActiveLocationJournalId() === journalId) storage.remove(ACTIVE_JOURNAL_KEY);
}

export function deactivateLocationJournal(journalId: string) {
  if (getActiveLocationJournalId() === journalId) storage.remove(ACTIVE_JOURNAL_KEY);
}
