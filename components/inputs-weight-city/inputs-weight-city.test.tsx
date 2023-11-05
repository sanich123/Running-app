import { screen } from '@testing-library/react-native';

import InputsWeightCity from './inputs-weight-city';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Inputs weight-city', () => {
  it('should correctly renders', () => {
    renderWithProviders(<InputsWeightCity />, { store: mockStore });
    expect(screen.getByTestId('inputWeight')).toBeOnTheScreen();
    expect(screen.getByTestId('inputCity')).toBeOnTheScreen();
  });
});
