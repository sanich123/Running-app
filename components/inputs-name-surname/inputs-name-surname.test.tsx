import { screen } from '@testing-library/react-native';

import InputsNameSurname from './inputs-name-surname';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Inputs name-surname', () => {
  it('should correctly renders', () => {
    renderWithProviders(<InputsNameSurname />, { store: mockStore });
    expect(screen.getByTestId('inputName')).toBeOnTheScreen();
    expect(screen.getByTestId('inputSurname')).toBeOnTheScreen();
  });
});
