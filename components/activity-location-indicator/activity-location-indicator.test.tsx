import { screen } from '@testing-library/react-native';

import ActivityLocationIndicator from './activity-location-indicator';
import { ACTIVITY } from '../../constants/texts/activity';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import * as useGetCurrentLocation from '../../utils/hooks/use-get-current-location';

describe('Activity location indicator', () => {
  it('should correctly render isLoading state', () => {
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: true,
      isError: false,
      isSuccess: false,
    }));
    renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText(ACTIVITY.english.GETTING_POSITION)).toBeDefined();
  });
  it('should correctly render isSuccess state', () => {
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: false,
      isError: false,
      isSuccess: true,
    }));
    renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText('Have got your position!')).toBeDefined();
  });
  it('should correctly render isError state', () => {
    jest.spyOn(useGetCurrentLocation, 'default').mockImplementation(() => ({
      isLoading: false,
      isError: true,
      isSuccess: false,
    }));
    renderWithProviders(<ActivityLocationIndicator />, { store: mockStore });
    expect(screen.getByText('An error occured')).toBeDefined();
  });
});
