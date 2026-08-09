import { act, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import CrossPlatformLayout from './cross-platform-layout';

describe('CrossPlatformLayout', () => {
  it.each([
    ['loading', true, false],
    ['success', false, false],
    ['error', false, true],
  ])('renders children in %s state', async (_, isLoading, isError) => {
    await renderWithProviders(
      <CrossPlatformLayout isLoading={isLoading} isError={isError}>
        <Text testID="layout-content" />
      </CrossPlatformLayout>,
    );
    expect(screen.getByTestId('layout-content')).toBeOnTheScreen();
  });

  it('calls refetch from pull-to-refresh', async () => {
    const refetch = jest.fn();
    await renderWithProviders(
      <CrossPlatformLayout scrollViewEnabled refetch={refetch}>
        <Text testID="refresh-content" />
      </CrossPlatformLayout>,
    );
    await act(async () => screen.getByTestId('cross-platform-scroll-view').props.refreshControl.props.onRefresh());
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
