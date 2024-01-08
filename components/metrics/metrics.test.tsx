import { changeLanguage } from '@R/language/language';
import { setIsMapVisible } from '@R/location/location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { MAP_METRICS } from './const';
import Metrics from './metrics';

describe('Metrics', () => {
  it('should correctly renders in english, when initial store', () => {
    renderWithProviders(<Metrics />, { store: mockStore });
    [MAP_METRICS.english.distance, MAP_METRICS.english.pace, MAP_METRICS.english.time].map((metric) =>
      expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen(),
    );
    ['0 /km', '0.00 km', '00:00:00'].map((metric) => expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen());
  });
  it('should correctly renders in english extended view with altitude and last km', () => {
    mockStore.dispatch(setIsMapVisible(false));
    renderWithProviders(<Metrics />, { store: mockStore });
    [
      MAP_METRICS.english.distance,
      MAP_METRICS.english.pace,
      MAP_METRICS.english.time,
      MAP_METRICS.english.altitude,
    ].map((metric) => expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen());
    ['0 /km', '0.00 km', '00:00:00'].map((metric) => expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen());
  });
  it('should correctly renders in russian, when initial store', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<Metrics />, { store: mockStore });
    [MAP_METRICS.russian.distance, MAP_METRICS.russian.pace, MAP_METRICS.russian.time].map((metric) =>
      expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen(),
    );
    [`0 /${MAP_METRICS.russian.km}`, `0.00 ${MAP_METRICS.russian.km}`, '00:00:00'].map((metric) =>
      expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen(),
    );
  });

  it('should correctly renders in russian extended view with altitude and last km, when initial store', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setIsMapVisible(false));
    renderWithProviders(<Metrics />, { store: mockStore });
    [
      MAP_METRICS.russian.distance,
      MAP_METRICS.russian.pace,
      MAP_METRICS.russian.time,
      MAP_METRICS.russian.altitude,
    ].map((metric) => expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen());
    [`0 /${MAP_METRICS.russian.km}`, `0.00 ${MAP_METRICS.russian.km}`, '00:00:00'].map((metric) =>
      expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen(),
    );
  });
});
