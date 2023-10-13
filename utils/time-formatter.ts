import moment from 'moment';

export function formatDuration(duration: number) {
  return moment.utc(moment.duration(duration, 'ms').asMilliseconds()).format('HH:mm:ss');
}

export function calculateAge(dateOfBirth: Date) {
  const msDiff = Date.now() - dateOfBirth.getTime();
  const ageDate = new Date(msDiff);

  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function formatDate(dateString: Date) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getHoursMinutes(dateString: Date) {
  const hours = new Date(dateString).getHours();
  const minutes = new Date(dateString).getMinutes();
  return `at ${hours < 10 ? `0${hours}` : `${hours}`}:${minutes < 10 ? `0${minutes}` : `${minutes}`}`;
}
