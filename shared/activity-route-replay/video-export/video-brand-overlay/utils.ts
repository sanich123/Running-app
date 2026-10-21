export function formatWorkoutTime(timeMs: number) {
  const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return hours > 0 ? `${hours}:${paddedMinutes}:${paddedSeconds}` : `${minutes}:${paddedSeconds}`;
}

export function formatRunningPace(speedMetersPerSecond: number, paceUnit: string) {
  const secondsPerKilometer = Math.round(1000 / speedMetersPerSecond);
  const minutes = Math.floor(secondsPerKilometer / 60);
  const seconds = String(secondsPerKilometer % 60).padStart(2, '0');

  return `${minutes}:${seconds} ${paceUnit}`;
}
