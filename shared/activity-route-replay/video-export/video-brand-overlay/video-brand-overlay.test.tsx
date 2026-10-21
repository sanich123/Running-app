import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import VideoBrandOverlay from './video-brand-overlay';
import type { ReplayCopy } from '../../types';

const copy: ReplayCopy = {
  play: 'Play',
  pause: 'Pause',
  resume: 'Resume',
  replay: 'Replay',
  position: 'Route position',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  duration: 'Duration',
  playbackTime: 'Playback',
  workoutTime: 'Workout',
  currentSpeed: 'Speed',
  shareVideo: 'Share video',
  shareUnavailable: 'Sharing unavailable',
  exportProgress: 'Preparing video',
  videoReady: 'Video ready',
  videoSize: 'File size',
  cancel: 'Cancel',
  share: 'Share',
  kmh: 'km/h',
  satellite: 'Satellite',
  map: 'Map',
};

const defaults = {
  sport: 'run',
  workoutDate: '2026-09-30T08:00:00.000Z',
  workoutDuration: 3_723_000,
  distance: 1_250,
  progress: 1,
  currentSpeed: 2.5,
  language: LANGUAGES.russian,
  copy,
};

describe('video brand overlay', () => {
  it('renders Russian running metrics and formats elapsed time and pace', async () => {
    await renderWithProviders(<VideoBrandOverlay {...defaults} />);

    expect(screen.getByText('RUNICH')).toBeOnTheScreen();
    expect(screen.getByText('БЕГ')).toBeOnTheScreen();
    expect(screen.getByText('1,25 км')).toBeOnTheScreen();
    expect(screen.getByText('1:02:03')).toBeOnTheScreen();
    expect(screen.getByText('6:40 мин/км')).toBeOnTheScreen();
    expect(screen.getByText(/2026/)).toBeOnTheScreen();
  });

  it('uses the localized fallback pace unit and formats sub-hour duration', async () => {
    const copyWithoutPaceUnit = { ...copy, paceUnit: undefined };
    await renderWithProviders(
      <VideoBrandOverlay {...defaults} copy={copyWithoutPaceUnit} workoutDuration={125_000} currentSpeed={4} />,
    );

    expect(screen.getByText('4:10 мин/км')).toBeOnTheScreen();
    expect(screen.getByText('2:05')).toBeOnTheScreen();
  });

  it('renders an English ride with speed in kilometres per hour and no date', async () => {
    await renderWithProviders(
      <VideoBrandOverlay
        {...defaults}
        sport="ride"
        workoutDate="2026-09-30T08:00:00.000Z"
        workoutDuration={62_000}
        distance={12_000}
        currentSpeed={3}
        language={LANGUAGES.english}
      />,
    );

    expect(screen.getByText('CYCLING')).toBeOnTheScreen();
    expect(screen.getByText('12.00 km')).toBeOnTheScreen();
    expect(screen.getByText('10.8 km/h')).toBeOnTheScreen();
    expect(screen.getByText('1:02')).toBeOnTheScreen();
    expect(screen.getByText(/2026/)).toBeOnTheScreen();
  });

  it('falls back to an unknown sport label and clamps negative time and speed', async () => {
    await renderWithProviders(
      <VideoBrandOverlay
        {...defaults}
        sport="yoga"
        workoutDate={undefined}
        workoutDuration={-1}
        distance={0}
        progress={1}
        currentSpeed={0}
        language={LANGUAGES.english}
      />,
    );

    expect(screen.getByText('YOGA')).toBeOnTheScreen();
    expect(screen.getByText('0.00 km')).toBeOnTheScreen();
    expect(screen.getByText('0:00')).toBeOnTheScreen();
    expect(screen.getByText('—')).toBeOnTheScreen();
  });

  it('uses the Russian default workout label when sport is missing', async () => {
    await renderWithProviders(<VideoBrandOverlay {...defaults} sport={undefined} currentSpeed={3} />);

    expect(screen.getByText('ТРЕНИРОВКА')).toBeOnTheScreen();
    expect(screen.getByText('10,8 км/ч')).toBeOnTheScreen();
  });

  it('uses the English default workout and pace labels when sport is missing or a pace unit is absent', async () => {
    const copyWithoutPaceUnit = { ...copy, paceUnit: undefined };
    await renderWithProviders(
      <VideoBrandOverlay
        {...defaults}
        sport={undefined}
        currentSpeed={3}
        language={LANGUAGES.english}
        copy={copyWithoutPaceUnit}
      />,
    );

    expect(screen.getByText('WORKOUT')).toBeOnTheScreen();
    expect(screen.getByText('10.8 km/h')).toBeOnTheScreen();
    expect(screen.getByText(/2026/)).toBeOnTheScreen();
  });

  it('uses the English fallback pace unit for a run', async () => {
    await renderWithProviders(
      <VideoBrandOverlay {...defaults} language={LANGUAGES.english} copy={{ ...copy, paceUnit: undefined }} />,
    );

    expect(screen.getByText('6:40 min/km')).toBeOnTheScreen();
  });
});
