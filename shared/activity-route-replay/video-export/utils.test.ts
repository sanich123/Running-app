import {
  formatReplayVideoSize,
  getReplayVideoFilename,
  getReplayVideoPath,
  getReplayVideoSize,
  getReplayVideoUri,
} from './utils';

describe('route video export utilities', () => {
  it('keeps output dimensions even, scales oversized frames and enforces a minimum', () => {
    expect(getReplayVideoSize(400, 300, 2)).toEqual({ width: 800, height: 600 });
    expect(getReplayVideoSize(2_000, 1_000, 1)).toEqual({ width: 1_280, height: 640 });
    expect(getReplayVideoSize(0.5, 0.5, 1)).toEqual({ width: 2, height: 2 });
  });

  it('converts encoded file paths and adds the file scheme when needed', () => {
    expect(getReplayVideoPath('file:///cache/my%20workout.mp4')).toBe('/cache/my workout.mp4');
    expect(getReplayVideoPath('/cache/workout.mp4')).toBe('/cache/workout.mp4');
    expect(getReplayVideoUri('/cache/workout.mp4')).toBe('file:///cache/workout.mp4');
    expect(getReplayVideoUri('file:///cache/workout.mp4')).toBe('file:///cache/workout.mp4');
  });

  it('uses valid workout dates and falls back for missing or invalid dates', () => {
    expect(getReplayVideoFilename('2026-09-30T08:59:44.000Z')).toMatch(/2026-09-30 .*\.mp4$/);
    expect(getReplayVideoFilename()).toMatch(/^\d{4}-\d{2}-\d{2} .*\.mp4$/);
    expect(getReplayVideoFilename('not-a-date')).toMatch(/^\d{4}-\d{2}-\d{2} .*\.mp4$/);
  });

  it('formats small and megabyte-sized video files', () => {
    expect(formatReplayVideoSize(0)).toBe('1 KB');
    expect(formatReplayVideoSize(2_000)).toBe('2 KB');
    expect(formatReplayVideoSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });
});
