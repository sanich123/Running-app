import { screen } from '@testing-library/react-native';

import CardMapImagesList from '../../components/card-map-images-list/card-map-images-list';
import { MOCK_LOCATIONS } from '../mocks/mock-location';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

describe('Activity card map images', () => {
  it('should correctly renders', () => {
    renderWithProviders(<CardMapImagesList locations={MOCK_LOCATIONS} photoUrls={['someurl']} id="someId" />, {
      store: mockStore,
    });
    expect(screen.getByTestId('someurl')).toBeOnTheScreen();
  });
});
