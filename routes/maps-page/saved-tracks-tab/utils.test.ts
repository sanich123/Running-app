import { LANGUAGES } from '@const/enums';
import { formatSavedTrackCount, formatStorageSize } from './utils';

describe('saved track labels', () => {
  it('uses English and Russian track plurals', () => {
    expect(formatSavedTrackCount(1, LANGUAGES.english)).toBe('1 track');
    expect(formatSavedTrackCount(3, LANGUAGES.english)).toBe('3 tracks');
    expect(formatSavedTrackCount(1, LANGUAGES.russian)).toBe('1 трек');
    expect(formatSavedTrackCount(2, LANGUAGES.russian)).toBe('2 трека');
    expect(formatSavedTrackCount(5, LANGUAGES.russian)).toBe('5 треков');
    expect(formatSavedTrackCount(11, LANGUAGES.russian)).toBe('11 треков');
    expect(formatSavedTrackCount(12, LANGUAGES.russian)).toBe('12 треков');
    expect(formatSavedTrackCount(14, LANGUAGES.russian)).toBe('14 треков');
    expect(formatSavedTrackCount(21, LANGUAGES.russian)).toBe('21 трек');
    expect(formatSavedTrackCount(22, LANGUAGES.russian)).toBe('22 трека');
    expect(formatSavedTrackCount(24, LANGUAGES.russian)).toBe('24 трека');
  });

  it('formats bytes, kilobytes and megabytes in both languages', () => {
    expect(formatStorageSize(512, LANGUAGES.english)).toBe('512 B');
    expect(formatStorageSize(1536, LANGUAGES.english)).toBe('1.5 KB');
    expect(formatStorageSize(1_572_864, LANGUAGES.english)).toBe('1.5 MB');
    expect(formatStorageSize(512, LANGUAGES.russian)).toBe('512 Б');
    expect(formatStorageSize(1536, LANGUAGES.russian)).toBe('1,5 КБ');
    expect(formatStorageSize(1_572_864, LANGUAGES.russian)).toBe('1,5 МБ');
  });
});
