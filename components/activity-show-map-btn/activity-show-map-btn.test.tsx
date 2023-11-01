import { screen, userEvent } from '@testing-library/react-native';

import ActivityShowMapBtn from './activity-show-map-btn';
import { setIsMapVisible } from '../../redux/location/location';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Activity show map btn', () => {
  it('should correctly change isMapVisible predicate', async () => {
    mockStore.dispatch(setIsMapVisible(true));
    renderWithProviders(<ActivityShowMapBtn />, { store: mockStore });
    const showMapBtn = screen.getByTestId('showMapButton');
    await userEvent.press(showMapBtn);
    expect(mockStore.getState().location.isMapVisible).toEqual(false);
    await userEvent.press(showMapBtn);
    expect(mockStore.getState().location.isMapVisible).toEqual(true);
  });
});
