/**
 * Upper bounds for the four sports available on the tracking screen.
 * They intentionally leave room for a realistic sprint/descent, while
 * filtering the most common GPS jumps.
 */
const MAX_TRACKING_SPEED_KMH = {
  walk: 15,
  run: 30,
  bike: 60,
  hike: 20,
} as const;

const DEFAULT_MAX_TRACKING_SPEED_KMH = MAX_TRACKING_SPEED_KMH.run;

export function getSpeedInMinsInKm(distance: number, time: number) {
  if (!Number.isFinite(distance) || distance <= 0 || !Number.isFinite(time) || time <= 0) {
    return { paceAsNumber: 0, paceAsString: '0.00' };
  }

  const secondsPerKilometer = Math.round(time / 1000 / (distance / 1000));
  const wholeMinutes = Math.floor(secondsPerKilometer / 60);
  const restSeconds = secondsPerKilometer % 60;
  const modifiedSeconds = restSeconds.toString().padStart(2, '0');
  const paceAsString = `${wholeMinutes}.${modifiedSeconds}`;
  const paceAsNumber = Number(paceAsString);

  return { paceAsNumber, paceAsString };
}

export function getSpeedInKmPerHour(distance: number, time: number) {
  if (!distance || !time || time <= 0) {
    return 0;
  }

  return distance / 1000 / (time / 3_600_000);
}

export function getAverageCadence(steps: number | null | undefined, duration: number) {
  if (!steps || !duration || duration <= 0) return 0;
  return Math.round((steps * 60_000) / duration);
}

export function isWalkingActivity(sport: string) {
  return sport.toLowerCase() === 'walk' || sport.toLowerCase() === 'walking';
}

export function isHikingActivity(sport: string) {
  const normalizedSport = sport.toLowerCase();
  return normalizedSport === 'hike' || normalizedSport === 'hiking';
}

export function isWalkingOrHikingActivity(sport: string) {
  return isWalkingActivity(sport) || isHikingActivity(sport);
}

export function isCyclingActivity(sport: string) {
  const normalizedSport = sport.toLowerCase();
  return normalizedSport === 'bike' || normalizedSport === 'ride' || normalizedSport === 'cycling';
}

export function isRunningActivity(sport: string) {
  const normalizedSport = sport.toLowerCase();
  return normalizedSport === 'run' || normalizedSport === 'running';
}

export function getMaxTrackingSpeedForSport(sport: string) {
  return MAX_TRACKING_SPEED_KMH[sport as keyof typeof MAX_TRACKING_SPEED_KMH] ?? DEFAULT_MAX_TRACKING_SPEED_KMH;
}
