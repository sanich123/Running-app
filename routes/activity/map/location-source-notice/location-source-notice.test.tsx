import { render, screen } from '@testing-library/react-native';
import LocationSourceNotice from './location-source-notice';

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 12, right: 0, bottom: 0, left: 0 }),
}));

describe('LocationSourceNotice', () => {
  it('does not render when there is no location notice', async () => {
    await render(<LocationSourceNotice message={null} />);

    expect(screen.queryByTestId('location-source-notice')).toBeNull();
  });

  it('shows the active location notice as an alert', async () => {
    await render(<LocationSourceNotice message="Using the phone location" />);

    const notice = screen.getByTestId('location-source-notice');
    expect(notice).toHaveProp('accessibilityRole', 'alert');
    expect(notice).toHaveTextContent('Using the phone location');
  });
});
