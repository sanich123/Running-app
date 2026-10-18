import { lazy } from 'react';
import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import LazyHeader from './lazy-header';

describe('LazyHeader', () => {
  it('renders the lazily loaded header component', async () => {
    const Header = lazy(async () => ({ default: () => <Text>Loaded header</Text> }));
    await renderWithProviders(<LazyHeader component={Header} />);

    expect(await screen.findByText('Loaded header')).toBeOnTheScreen();
  });
});
