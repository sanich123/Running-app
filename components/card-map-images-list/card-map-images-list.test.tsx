import { screen } from '@testing-library/react-native';

import CardMapImagesList from './card-map-images-list';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/home/activity/someActivityId',
}));

describe('Activity card map images', () => {
  it('should correctly renders', () => {
    renderWithProviders(<CardMapImagesList id="someId" photoUrls={['someUrl']} />, {
      store: mockStore,
    });
    expect(screen.getByTestId('someUrl')).toBeOnTheScreen();
  });
});
