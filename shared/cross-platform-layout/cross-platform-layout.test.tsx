import { act, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { getCrossPlatformLayoutEdges } from './const';
import CrossPlatformLayout from './cross-platform-layout';

describe('getCrossPlatformLayoutEdges', () => {
  it('leaves the Android navigation inset to the root stack', () => {
    expect(getCrossPlatformLayoutEdges(['top', 'bottom', 'left'], 'android')).toEqual(['top', 'left']);
    expect(getCrossPlatformLayoutEdges({ top: 'maximum', bottom: 'additive' }, 'android')).toEqual({
      top: 'maximum',
      bottom: 'off',
    });
  });

  it('preserves the requested edges on other platforms', () => {
    const edges = ['top', 'bottom'] as const;
    expect(getCrossPlatformLayoutEdges(edges, 'ios')).toBe(edges);
  });
});

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

  it('keeps pull-to-refresh available for an empty or error state', async () => {
    const refetch = jest.fn();
    await renderWithProviders(
      <CrossPlatformLayout scrollViewEnabled isError refetch={refetch}>
        <Text testID="refreshable-status-content" />
      </CrossPlatformLayout>,
    );

    const refreshControl = screen.getByTestId('cross-platform-scroll-view').props.refreshControl;
    await act(async () => refreshControl.props.onRefresh());

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
