import { screen } from '@testing-library/react-native';

import CardDescription from './description';
import { renderWithProviders } from '../../../tests/utils/test-utils';

describe('Activity card description', () => {
  it('should correctly renders passed info', () => {
    renderWithProviders(<CardDescription description="some description" />);
    expect(screen.getByText('some description')).toBeOnTheScreen();
  });
});
