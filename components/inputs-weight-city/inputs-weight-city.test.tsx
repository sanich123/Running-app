import * as auth from '@A/context/auth-context';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen, userEvent } from '@testing-library/react-native';

import { CITY_TEST_ID, WEIGHT_TEST_ID } from './const';
import InputsWeightCity from './inputs-weight-city';

describe('Inputs weight-city', () => {
  it('should correctly handle user typings', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<InputsWeightCity isDisabled={false} />, { store: mockStore });
    const inputWeight = screen.getByTestId(WEIGHT_TEST_ID);
    const inputCity = screen.getByTestId(CITY_TEST_ID);
    await userEvent.type(inputWeight, '90');
    expect(mockStore.getState().profile.settings.weight).toEqual('90');
    await userEvent.type(inputCity, 'Otso-city');
    expect(mockStore.getState().profile.settings.city).toEqual('Otso-city');
  });
  it('should correctly handle isDisabled state', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<InputsWeightCity isDisabled />, { store: mockStore });
    expect(screen.getByTestId(WEIGHT_TEST_ID)).toBeDisabled();
    expect(screen.getByTestId(CITY_TEST_ID)).toBeDisabled();
  });
  it('should correctly renders', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<InputsWeightCity isDisabled={false} />, { store: mockStore });
    expect(screen.getByTestId(WEIGHT_TEST_ID)).toBeOnTheScreen();
    expect(screen.getByTestId(CITY_TEST_ID)).toBeOnTheScreen();
  });
});
