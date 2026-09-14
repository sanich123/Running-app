import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setAltitude, setIsMapVisible, setSteps } from '@R/slices/location/location';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore, resetMockLocation } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { useActivitySportParams } from '../activity-params';
import { MAP_METRICS } from './const';
import Metrics from './metrics';

jest.mock('../activity-params', () => ({
  useActivitySportParams: jest.fn(),
  useGlobalActivitySportParams: jest.fn(() => ({ sport: 'run' })),
}));

const mockUseActivitySportParams = useActivitySportParams as jest.Mock;

describe('Metrics', () => {
  beforeEach(() => {
    mockStore.dispatch(resetMockLocation());
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockUseActivitySportParams.mockReturnValue({ sport: 'run' });
  });

  it('renders the compact running metrics in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setIsMapVisible(true));
    await renderWithProviders(<Metrics />, { store: mockStore });
    [MAP_METRICS.english.distance, MAP_METRICS.english.pace, MAP_METRICS.english.time].map((metric) =>
      expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen(),
    );
    ['0 /km', '0.00 km', '00:00:00'].map((metric) => expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen());
  });
  it('renders five running metrics in english extended view', async () => {
    mockStore.dispatch(setIsMapVisible(false));
    mockStore.dispatch(setAltitude(42));
    await renderWithProviders(<Metrics />, { store: mockStore });
    [
      MAP_METRICS.english.distance,
      MAP_METRICS.english.pace,
      MAP_METRICS.english.time,
      MAP_METRICS.english.altitude,
      MAP_METRICS.english.lastKm,
    ].map((metric) => expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen());
    ['0 /km', '0.00 km', '00:00:00'].map((metric) => expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen());
    expect(screen.getByText('42 m')).toBeOnTheScreen();
  });

  it('renders the compact running metrics in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setIsMapVisible(true));
    await renderWithProviders(<Metrics />, { store: mockStore });
    [MAP_METRICS.russian.distance, MAP_METRICS.russian.pace, MAP_METRICS.russian.time].map((metric) =>
      expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen(),
    );
    [`0 /${MAP_METRICS.russian.km}`, `0.00 ${MAP_METRICS.russian.km}`, '00:00:00'].map((metric) =>
      expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen(),
    );
  });

  it('renders steps instead of elevation for walking in russian extended view', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setIsMapVisible(false));
    mockStore.dispatch(setSteps(1234));
    mockUseActivitySportParams.mockReturnValue({ sport: 'walk' });
    await renderWithProviders(<Metrics />, { store: mockStore });
    [
      MAP_METRICS.russian.distance,
      MAP_METRICS.russian.speed,
      MAP_METRICS.russian.time,
      MAP_METRICS.russian.steps,
      MAP_METRICS.russian.lastKm,
    ].map((metric) => expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen());
    expect(screen.getAllByText(new RegExp(`0.0 ${MAP_METRICS.russian.kmh}`))).toHaveLength(2);
    [`0.00 ${MAP_METRICS.russian.km}`, '00:00:00', '1234'].map((metric) =>
      expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen(),
    );
    expect(screen.queryByText(new RegExp(MAP_METRICS.russian.altitude))).not.toBeOnTheScreen();
    expect(screen.queryByText(new RegExp(MAP_METRICS.russian.cadence))).not.toBeOnTheScreen();
  });

  it.each([
    ['bike', MAP_METRICS.english.altitude, '42 m', MAP_METRICS.english.steps],
    ['hike', MAP_METRICS.english.steps, '1234', MAP_METRICS.english.altitude],
  ])('renders five sport-specific metrics for %s in extended view', async (sport, topTitle, topValue, hiddenTitle) => {
    mockStore.dispatch(setIsMapVisible(false));
    mockStore.dispatch(setAltitude(42));
    mockStore.dispatch(setSteps(1234));
    mockUseActivitySportParams.mockReturnValue({ sport });
    await renderWithProviders(<Metrics />, { store: mockStore });

    [
      MAP_METRICS.english.distance,
      MAP_METRICS.english.speed,
      MAP_METRICS.english.time,
      topTitle,
      MAP_METRICS.english.lastKm,
    ].map((metric) => expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen());
    expect(screen.getByText(topValue)).toBeOnTheScreen();
    expect(screen.queryByText(new RegExp(hiddenTitle))).not.toBeOnTheScreen();
    expect(screen.queryByText(new RegExp(MAP_METRICS.english.cadence))).not.toBeOnTheScreen();
    expect(screen.getAllByText(/:$/)).toHaveLength(5);
  });
});
