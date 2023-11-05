import { screen } from '@testing-library/react-native';

import ResetBtn from './reset-btn';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Reset btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ResetBtn />, { store: mockStore });
    expect(screen.getByText('Reset')).toBeOnTheScreen();
  });
});
