import { screen, userEvent } from '@testing-library/react-native';

import InputsWeightCity from './inputs-weight-city';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Inputs weight-city', () => {
  it('should correctly renders', () => {
    renderWithProviders(
      <InputsWeightCity city="" setCity={jest.fn()} weight=" " setWeight={jest.fn()} isDisabled={false} />,
      { store: mockStore },
    );
    expect(screen.getByTestId('inputWeight')).toBeOnTheScreen();
    expect(screen.getByTestId('inputCity')).toBeOnTheScreen();
  });
  it('should correctly handle user typings', async () => {
    const setCityFn = jest.fn();
    const setWeightFn = jest.fn();
    renderWithProviders(
      <InputsWeightCity city="" setCity={setCityFn} weight="" setWeight={setWeightFn} isDisabled={false} />,
      { store: mockStore },
    );
    const inputWeight = screen.getByTestId('inputWeight');
    const inputCity = screen.getByTestId('inputCity');
    await userEvent.type(inputWeight, '90');
    expect(setWeightFn).toHaveBeenCalledTimes(2);
    await userEvent.type(inputCity, 'Otso-city');
    expect(setCityFn).toHaveBeenCalledTimes(9);
  });
  it('should correctly handle isDisabled state', async () => {
    const setCityFn = jest.fn();
    const setWeightFn = jest.fn();
    renderWithProviders(
      <InputsWeightCity city="" setCity={setCityFn} weight=" " setWeight={setWeightFn} isDisabled />,
      { store: mockStore },
    );
    expect(screen.getByTestId('inputWeight')).toBeDisabled();
    expect(screen.getByTestId('inputCity')).toBeDisabled();
  });
});
