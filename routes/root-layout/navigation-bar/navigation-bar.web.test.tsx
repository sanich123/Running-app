import { render, screen } from '@testing-library/react-native';
import NavigationBar from './navigation-bar.web';

describe('WebNavigationBar', () => {
  it('renders no native navigation bar on web', async () => {
    await render(<NavigationBar />);

    expect(screen.queryByTestId('native-navigation-bar')).toBeNull();
  });
});
