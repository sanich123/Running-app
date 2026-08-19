import { render, screen } from '@testing-library/react-native';
import ActivityIcon from './activity-icon';
import HomeIcon from './home-icon';

jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  const { View, Text } = require('react-native');
  return {
    ...actual,
    IconButton: (props: any) => (
      <View testID="icon-button">
        <Text testID="icon-name">{props.icon}</Text>
        <Text testID="icon-size">{String(props.size)}</Text>
        <Text testID="icon-color">{props.iconColor}</Text>
      </View>
    ),
  };
});

describe('icons', () => {
  it('changes the home icon and color when focus changes', async () => {
    await render(<HomeIcon focused />);
    expect(screen.getByTestId('icon-name')).toHaveTextContent('home-outline');
    await render(<HomeIcon focused={false} />);
    expect(screen.getByTestId('icon-name')).toHaveTextContent('home');
  });

  it('renders the activity run icon', async () => {
    await render(<ActivityIcon focused />);
    expect(screen.getByTestId('icon-size')).toHaveTextContent('56');
  });
});
