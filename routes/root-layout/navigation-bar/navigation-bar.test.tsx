import { render, screen } from '@testing-library/react-native';
import NavigationBar from './navigation-bar';

jest.mock('expo-navigation-bar', () => {
  const { View } = jest.requireActual('react-native');
  return {
    NavigationBar: ({ style }: { style: string }) => <View testID="native-navigation-bar" accessibilityLabel={style} />,
  };
});

describe('NavigationBar', () => {
  it('uses the platform-managed navigation bar style', async () => {
    await render(<NavigationBar />);

    expect(screen.getByTestId('native-navigation-bar')).toHaveProp('accessibilityLabel', 'auto');
  });
});
