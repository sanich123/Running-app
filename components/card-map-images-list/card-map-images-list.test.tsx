import { screen } from '@testing-library/react-native';

import CardMapImagesList from './card-map-images-list';
import { MOCK_LOCATIONS } from '../../tests/mocks/mock-location';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Activity card map images', () => {
  it('should correctly renders', () => {
    renderWithProviders(<CardMapImagesList locations={MOCK_LOCATIONS} photoUrls={['someurl']} id="someId" />, {
      store: mockStore,
    });
    expect(screen.getByTestId('someurl')).toBeOnTheScreen();
  });
});
