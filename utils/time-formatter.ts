import moment from 'moment';

export function formatDuration(duration: number) {
  return moment.utc(moment.duration(duration, 's').asMilliseconds()).format('HH:mm:ss');
}

export function calculateAge(dateOfBirth: Date) {
  const msDiff = Date.now() - dateOfBirth.getTime();
  const ageDate = new Date(msDiff);

  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
