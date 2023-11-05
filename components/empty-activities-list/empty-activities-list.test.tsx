import { render, screen } from '@testing-library/react-native';

import EmptyActivitiesList from './empty-activities-list';

describe('Empty activities list', () => {
  it('should contain proper information', () => {
    render(<EmptyActivitiesList />);
    expect(screen.getByText('There will be yours and your friends activities...')).toBeOnTheScreen();
  });
});
