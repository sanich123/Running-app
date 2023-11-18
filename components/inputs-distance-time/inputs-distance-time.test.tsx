import { screen } from '@testing-library/react-native';

import InputsDistanceTime from './inputs-distance-time';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Inputs manual distance duration', () => {
  it('shoudl correctly renders in english', () => {
    renderWithProviders(<InputsDistanceTime isDisabled={false} />, { store: mockStore });
    screen.debug();
  });
});
