import { screen } from '@testing-library/react-native';

import InputBio from './input-bio';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Input bio', () => {
  it('should correctly renders', () => {
    renderWithProviders(<InputBio />, { store: mockStore });
    expect(screen.getByTestId('inputBio')).toBeOnTheScreen();
  });
});
