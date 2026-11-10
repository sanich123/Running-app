import type { ActivityLocation } from '@S/card/types';

const FIT_EPOCH_MS = 631_065_600_000;
const FIT_HEADER_SIZE = 14;
const FIT_INVALID_UINT16 = 0xffff;
const FIT_CRC_TABLE = [
  0x0000, 0xcc01, 0xd801, 0x1400, 0xf001, 0x3c00, 0x2800, 0xe401, 0xa001, 0x6c00, 0x7800, 0xb401, 0x5000, 0x9c01,
  0x8801, 0x4400,
];

interface FitField {
  number: number;
  size: number;
  baseType: number;
}

function appendUint16(bytes: number[], value: number) {
  bytes.push(value & 0xff, (value >>> 8) & 0xff);
}

function appendUint32(bytes: number[], value: number) {
  bytes.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function appendMessageDefinition(
  bytes: number[],
  localMessageNumber: number,
  globalMessageNumber: number,
  fields: FitField[],
) {
  bytes.push(0x40 | localMessageNumber, 0, 0);
  appendUint16(bytes, globalMessageNumber);
  bytes.push(fields.length);
  for (const { number, size, baseType } of fields) bytes.push(number, size, baseType);
}

function appendMessage(bytes: number[], localMessageNumber: number, fields: FitField[], values: number[]) {
  bytes.push(localMessageNumber);
  fields.forEach(({ size }, index) => {
    const value = values[index] ?? 0;
    if (size === 1) bytes.push(value & 0xff);
    else if (size === 2) appendUint16(bytes, value);
    else appendUint32(bytes, value);
  });
}

function crc16(bytes: number[]) {
  let crc = 0;
  for (const byte of bytes) {
    let tmp = FIT_CRC_TABLE[crc & 0xf]!;
    crc = (crc >>> 4) & 0x0fff;
    crc ^= tmp ^ FIT_CRC_TABLE[byte & 0xf]!;
    tmp = FIT_CRC_TABLE[crc & 0xf]!;
    crc = (crc >>> 4) & 0x0fff;
    crc ^= tmp ^ FIT_CRC_TABLE[(byte >>> 4) & 0xf]!;
  }
  return crc & 0xffff;
}

function getUnixTimestamp(location: ActivityLocation) {
  const timestamp = location.timestamp ?? location.coords.timestamp;
  return typeof timestamp === 'number' && Number.isFinite(timestamp) ? timestamp : undefined;
}

function getSemicircles(degrees: number) {
  return Math.round((degrees * 2 ** 31) / 180);
}

function getSportId(sport: string) {
  const normalizedSport = sport.toLowerCase();
  if (normalizedSport.includes('cycl') || normalizedSport.includes('bike') || normalizedSport.includes('вел')) return 2;
  if (normalizedSport.includes('walk') || normalizedSport.includes('ходьб')) return 11;
  if (normalizedSport.includes('hike') || normalizedSport.includes('поход')) return 17;
  return 1;
}

function appendDefinitionAndMessage(
  bytes: number[],
  localMessageNumber: number,
  globalMessageNumber: number,
  fields: FitField[],
  values: number[],
) {
  appendMessageDefinition(bytes, localMessageNumber, globalMessageNumber, fields);
  appendMessage(bytes, localMessageNumber, fields, values);
}

export function encodeActivityLocationsAsFit(locations: ActivityLocation[], sport = 'running') {
  const validLocations = locations.filter(
    ({ coords }) => Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude),
  );
  if (validLocations.length < 2) throw new Error('Для экспорта FIT нужно не менее двух точек маршрута');

  const fallbackStartTime = Date.now();
  const unixTimestamps = validLocations.map(
    (location, index) => getUnixTimestamp(location) ?? fallbackStartTime + index * 1000,
  );
  const startTime = Math.max(0, Math.floor((unixTimestamps[0]! - FIT_EPOCH_MS) / 1000));
  const endTime = Math.max(0, Math.floor((unixTimestamps.at(-1)! - FIT_EPOCH_MS) / 1000));
  const elapsedFitUnits = Math.max(0, Math.round(unixTimestamps.at(-1)! - unixTimestamps[0]!));
  const first = validLocations[0]!;
  const sportId = getSportId(sport);
  const data: number[] = [];

  const fileIdFields: FitField[] = [
    { number: 0, size: 1, baseType: 0x00 },
    { number: 1, size: 2, baseType: 0x84 },
    { number: 2, size: 2, baseType: 0x84 },
    { number: 3, size: 4, baseType: 0x86 },
    { number: 4, size: 4, baseType: 0x86 },
  ];
  appendDefinitionAndMessage(data, 0, 0, fileIdFields, [4, 1, 0, 0, startTime]);

  const eventFields: FitField[] = [
    { number: 253, size: 4, baseType: 0x86 },
    { number: 0, size: 1, baseType: 0x00 },
    { number: 1, size: 1, baseType: 0x00 },
  ];
  appendDefinitionAndMessage(data, 1, 21, eventFields, [startTime, 0, 0]);

  const recordFields: FitField[] = [
    { number: 253, size: 4, baseType: 0x86 },
    { number: 0, size: 4, baseType: 0x85 },
    { number: 1, size: 4, baseType: 0x85 },
    { number: 2, size: 2, baseType: 0x84 },
    { number: 5, size: 4, baseType: 0x86 },
  ];
  appendMessageDefinition(data, 2, 20, recordFields);
  let accumulatedDistance = 0;
  validLocations.forEach((location, index) => {
    if (index > 0) {
      const previous = validLocations[index - 1]!;
      const latitudeOne = (previous.coords.latitude * Math.PI) / 180;
      const latitudeTwo = (location.coords.latitude * Math.PI) / 180;
      const latitudeDelta = latitudeTwo - latitudeOne;
      const longitudeDelta = ((location.coords.longitude - previous.coords.longitude) * Math.PI) / 180;
      const haversine =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDelta / 2) ** 2;
      accumulatedDistance += 6_371_000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    }

    const altitude = location.coords.altitude;
    const fitAltitude =
      typeof altitude === 'number' && Number.isFinite(altitude) && altitude >= -500
        ? Math.min(FIT_INVALID_UINT16 - 1, Math.round((altitude + 500) * 5))
        : FIT_INVALID_UINT16;
    appendMessage(data, 2, recordFields, [
      Math.max(0, Math.floor((unixTimestamps[index]! - FIT_EPOCH_MS) / 1000)),
      getSemicircles(location.coords.latitude),
      getSemicircles(location.coords.longitude),
      fitAltitude,
      Math.round(accumulatedDistance * 100),
    ]);
  });

  const elapsedSummaryFields: FitField[] = [
    { number: 253, size: 4, baseType: 0x86 },
    { number: 0, size: 1, baseType: 0x00 },
    { number: 1, size: 1, baseType: 0x00 },
  ];
  appendDefinitionAndMessage(data, 3, 21, elapsedSummaryFields, [endTime, 0, 1]);

  const lapFields: FitField[] = [
    { number: 253, size: 4, baseType: 0x86 },
    { number: 0, size: 1, baseType: 0x00 },
    { number: 1, size: 1, baseType: 0x00 },
    { number: 2, size: 4, baseType: 0x86 },
    { number: 7, size: 4, baseType: 0x86 },
    { number: 8, size: 4, baseType: 0x86 },
    { number: 9, size: 4, baseType: 0x86 },
    { number: 254, size: 2, baseType: 0x84 },
  ];
  appendDefinitionAndMessage(data, 4, 19, lapFields, [
    endTime,
    9,
    1,
    startTime,
    elapsedFitUnits,
    elapsedFitUnits,
    Math.round(accumulatedDistance * 100),
    0,
  ]);

  const sessionFields: FitField[] = [
    { number: 253, size: 4, baseType: 0x86 },
    { number: 2, size: 4, baseType: 0x86 },
    { number: 3, size: 4, baseType: 0x85 },
    { number: 4, size: 4, baseType: 0x85 },
    { number: 5, size: 1, baseType: 0x00 },
    { number: 6, size: 1, baseType: 0x00 },
    { number: 7, size: 4, baseType: 0x86 },
    { number: 8, size: 4, baseType: 0x86 },
    { number: 9, size: 4, baseType: 0x86 },
    { number: 25, size: 2, baseType: 0x84 },
    { number: 26, size: 2, baseType: 0x84 },
  ];
  appendDefinitionAndMessage(data, 5, 18, sessionFields, [
    endTime,
    startTime,
    getSemicircles(first.coords.latitude),
    getSemicircles(first.coords.longitude),
    sportId,
    0,
    elapsedFitUnits,
    elapsedFitUnits,
    Math.round(accumulatedDistance * 100),
    0,
    1,
  ]);

  const activityFields: FitField[] = [
    { number: 253, size: 4, baseType: 0x86 },
    { number: 0, size: 4, baseType: 0x86 },
    { number: 1, size: 2, baseType: 0x84 },
  ];
  appendDefinitionAndMessage(data, 6, 34, activityFields, [endTime, elapsedFitUnits, 1]);

  const header = [FIT_HEADER_SIZE, 0x20, 0x08, 0x04];
  appendUint32(header, data.length);
  header.push(0x2e, 0x46, 0x49, 0x54);
  appendUint16(header, crc16(header));
  const file = [...header, ...data];
  appendUint16(file, crc16(file));
  return new Uint8Array(file);
}
