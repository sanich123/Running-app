import type { ActivityLocation } from '@S/card/types';

export interface ImportedRoute {
  title: string;
  locations: ActivityLocation[];
}

function decodeXmlText(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

function getPointTimestamp(contents: string) {
  const timestampText = contents.match(/<(?:[\w.-]+:)?time\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?time\s*>/i)?.[1];
  if (!timestampText) return undefined;
  const timestamp = Date.parse(decodeXmlText(timestampText));
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function parseGpxLocations(contents: string) {
  const locations: ActivityLocation[] = [];
  const pointPattern = /<(?:[\w.-]+:)?(trkpt|rtept)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:[\w.-]+:)?\1\s*>)/gi;
  for (const match of contents.matchAll(pointPattern)) {
    const [, , attributes = '', pointContents = ''] = match;
    const latitude = Number(attributes.match(/\blat\s*=\s*["']([^"']+)["']/i)?.[1]);
    const longitude = Number(attributes.match(/\blon\s*=\s*["']([^"']+)["']/i)?.[1]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    const altitudeText = pointContents.match(/<(?:[\w.-]+:)?ele\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?ele\s*>/i)?.[1];
    const altitude = altitudeText === undefined ? undefined : Number(decodeXmlText(altitudeText));
    const timestamp = getPointTimestamp(pointContents);
    locations.push({
      coords: {
        latitude,
        longitude,
        ...(altitude !== undefined && Number.isFinite(altitude) ? { altitude } : {}),
        ...(timestamp !== undefined ? { timestamp } : {}),
      },
      ...(timestamp !== undefined ? { timestamp } : {}),
    });
  }
  return locations;
}

function parseKmlLocations(contents: string) {
  const locations: ActivityLocation[] = [];
  const coordinateBlocks = contents.matchAll(
    /<(?:[\w.-]+:)?coordinates\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?coordinates\s*>/gi,
  );
  for (const [, block = ''] of coordinateBlocks) {
    for (const coordinate of decodeXmlText(block).split(/\s+/)) {
      const [longitudeText, latitudeText, altitudeText] = coordinate.split(',');
      const latitude = Number(latitudeText);
      const longitude = Number(longitudeText);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
      const altitude = altitudeText === undefined || altitudeText === '' ? undefined : Number(altitudeText);
      locations.push({
        coords: {
          latitude,
          longitude,
          ...(altitude !== undefined && Number.isFinite(altitude) ? { altitude } : {}),
        },
      });
    }
  }
  return locations;
}

export function parseImportedRoute(filename: string, contents: string): ImportedRoute {
  const extension = filename.split('.').at(-1)?.toLowerCase();
  const isKml = extension === 'kml';
  if (!isKml && extension !== 'gpx') throw new Error('Choose a GPX or KML route file');

  const titleText = contents.match(/<(?:[\w.-]+:)?name\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?name\s*>/i)?.[1];
  const fallbackTitle = filename.replace(/\.(?:gpx|kml)$/i, '').trim();
  const locations = isKml ? parseKmlLocations(contents) : parseGpxLocations(contents);
  if (locations.length < 2) throw new Error('The route file must contain at least two valid points');

  return { title: titleText ? decodeXmlText(titleText) : fallbackTitle || 'Imported route', locations };
}
