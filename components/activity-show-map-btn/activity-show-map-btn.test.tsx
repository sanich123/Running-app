import { setIsMapVisible } from '@R/location/location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen, userEvent } from '@testing-library/react-native';

import ActivityShowMapBtn from './activity-show-map-btn';
import { ACTIVITY_SHOW_MAP_TEST_ID } from './const';

describe('Activity show map btn', () => {
  it('should correctly change isMapVisible predicate', async () => {
    mockStore.dispatch(setIsMapVisible(true));
    renderWithProviders(<ActivityShowMapBtn />, { store: mockStore });
    const showMapBtn = screen.getByTestId(ACTIVITY_SHOW_MAP_TEST_ID);
    await userEvent.press(showMapBtn);
    expect(mockStore.getState().location.isMapVisible).toEqual(false);
    await userEvent.press(showMapBtn);
    expect(mockStore.getState().location.isMapVisible).toEqual(true);
  });
});
