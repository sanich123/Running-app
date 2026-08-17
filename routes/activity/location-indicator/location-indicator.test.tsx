import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import * as useGetCurrentLocation from '@U/hooks/use-get-current-location';
import { ACTIVITY_LOCATION_INDICATOR } from './const';
import ActivityLocationIndicator from './location-indicator';

describe('Activity location indicator', () => {
  it('should correctly render isLoading state', async () => {
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: true,
      isError: false,
      isSuccess: false,
    }));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_LOCATION_INDICATOR.english.isLoading)).toBeOnTheScreen();
  });
  it('should correctly render isSuccess state', async () => {
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: false,
      isError: false,
      isSuccess: true,
    }));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_LOCATION_INDICATOR.english.isSuccess)).toBeOnTheScreen();
  });
  it('should correctly render isError state', async () => {
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: false,
      isError: true,
      isSuccess: false,
    }));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_LOCATION_INDICATOR.english.isError)).toBeOnTheScreen();
  });
  it('should correctly render isLoading state in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: true,
      isError: false,
      isSuccess: false,
    }));
    await renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_LOCATION_INDICATOR.russian.isLoading)).toBeOnTheScreen();
  });
  it('should correctly render isSuccess state in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: false,
      isError: false,
      isSuccess: true,
    }));
    await renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_LOCATION_INDICATOR.russian.isSuccess)).toBeOnTheScreen();
  });
  it('should correctly render isError state in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: false,
      isError: true,
      isSuccess: false,
    }));
    await renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_LOCATION_INDICATOR.russian.isError)).toBeOnTheScreen();
  });
});
