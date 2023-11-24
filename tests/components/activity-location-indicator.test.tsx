import { screen } from '@testing-library/react-native';

import ActivityLocationIndicator from '../../components/activity-location-indicator/activity-location-indicator';
import { ACTIVITY_LOCATION_INDICATOR } from '../../components/activity-location-indicator/const';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import * as useGetCurrentLocation from '../../utils/hooks/use-get-current-location';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

describe('Activity location indicator', () => {
  it('should correctly render isLoading state', () => {
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: true,
      isError: false,
      isSuccess: false,
    }));
    renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_LOCATION_INDICATOR.english.isLoading)).toBeOnTheScreen();
  });
  it('should correctly render isSuccess state', async () => {
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: false,
      isError: false,
      isSuccess: true,
    }));
    renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_LOCATION_INDICATOR.english.isSuccess)).toBeOnTheScreen();
  });
  it('should correctly render isError state', () => {
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: false,
      isError: true,
      isSuccess: false,
    }));
    renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_LOCATION_INDICATOR.english.isError)).toBeOnTheScreen();
  });
  it('should correctly render isLoading state in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: true,
      isError: false,
      isSuccess: false,
    }));
    renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_LOCATION_INDICATOR.russian.isLoading)).toBeOnTheScreen();
  });
  it('should correctly render isSuccess state in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: false,
      isError: false,
      isSuccess: true,
    }));
    renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_LOCATION_INDICATOR.russian.isSuccess)).toBeOnTheScreen();
  });
  it('should correctly render isError state in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: false,
      isError: true,
      isSuccess: false,
    }));
    renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_LOCATION_INDICATOR.russian.isError)).toBeOnTheScreen();
  });
});
