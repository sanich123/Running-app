import { setIsDisabledWhileSendingProfile } from '@R/profile/profile';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen, userEvent } from '@testing-library/react-native';

import { CITY_TEST_ID, WEIGHT_TEST_ID } from './const';
import InputsWeightCity from './inputs-weight-city';

describe('Inputs weight-city', () => {
  it('should correctly handle user typings', async () => {
    renderWithProviders(<InputsWeightCity isDisabled={false} />, { store: mockStore });
    const inputWeight = screen.getByTestId(WEIGHT_TEST_ID);
    const inputCity = screen.getByTestId(CITY_TEST_ID);
    await userEvent.type(inputWeight, '90');
    expect(mockStore.getState().profile.settings.weight).toEqual('90');
    await userEvent.type(inputCity, 'Otso-city');
    expect(mockStore.getState().profile.settings.city).toEqual('Otso-city');
  });
  it('should correctly handle isDisabled state', async () => {
    renderWithProviders(<InputsWeightCity isDisabled />, { store: mockStore });
    expect(screen.getByTestId(WEIGHT_TEST_ID)).toBeDisabled();
    expect(screen.getByTestId(CITY_TEST_ID)).toBeDisabled();
  });
  it('should correctly handle isDisabledWhileSending state', async () => {
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    renderWithProviders(<InputsWeightCity isDisabled={false} />, { store: mockStore });
    expect(screen.getByTestId(WEIGHT_TEST_ID)).toBeDisabled();
    expect(screen.getByTestId(CITY_TEST_ID)).toBeDisabled();
  });
});
