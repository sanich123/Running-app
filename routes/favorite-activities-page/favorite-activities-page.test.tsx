import type React from 'react';
import { screen } from '@testing-library/react-native';
import { HOME_FEED } from '@Routes/home-page/const';
import useHomePage from '@Routes/home-page/use-home-page';
import { renderWithProviders } from '@T/utils/test-utils';
import FavoriteActivitiesPage from './favorite-activities-page';

jest.mock('@Routes/home-page/use-home-page', () => jest.fn());
jest.mock('@S/cross-platform-layout/cross-platform-layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => {
    const ReactModule = jest.requireActual('react') as typeof React;
    const { View: NativeView } = jest.requireActual('react-native') as {
      View: React.ComponentType<React.PropsWithChildren>;
    };
    return ReactModule.createElement(NativeView, null, children);
  },
}));
jest.mock('@S/infinite-scroll-list/infinite-scroll-list', () => ({
  __esModule: true,
  default: () => {
    const ReactModule = jest.requireActual('react') as typeof React;
    const { Text: NativeText } = jest.requireActual('react-native') as {
      Text: React.ComponentType<React.PropsWithChildren<{ testID?: string }>>;
    };
    return ReactModule.createElement(NativeText, { testID: 'favorite-activity-list' }, 'Favorite workout list');
  },
}));
jest.mock('@Routes/home-page/empty-activities-list/empty-activities-list', () => ({
  __esModule: true,
  default: () => {
    const ReactModule = jest.requireActual('react') as typeof React;
    const { Text: NativeText } = jest.requireActual('react-native') as {
      Text: React.ComponentType<React.PropsWithChildren<{ testID?: string }>>;
    };
    return ReactModule.createElement(NativeText, { testID: 'empty-favorite-activities' }, 'No saved favorites');
  },
}));
jest.mock('@Routes/home-page/home-feed-error/home-feed-error', () => ({
  __esModule: true,
  default: () => {
    const ReactModule = jest.requireActual('react') as typeof React;
    const { Text: NativeText } = jest.requireActual('react-native') as {
      Text: React.ComponentType<React.PropsWithChildren<{ testID?: string }>>;
    };
    return ReactModule.createElement(NativeText, { testID: 'favorite-feed-error' }, 'Unable to load favorites');
  },
}));
jest.mock('@Routes/home-page/home-feed-skeleton/home-feed-skeleton', () => ({
  __esModule: true,
  default: () => {
    const ReactModule = jest.requireActual('react') as typeof React;
    const { Text: NativeText } = jest.requireActual('react-native') as {
      Text: React.ComponentType<React.PropsWithChildren<{ testID?: string }>>;
    };
    return ReactModule.createElement(NativeText, { testID: 'favorite-feed-loading' }, 'Loading favorites');
  },
}));

describe('favorite activities page', () => {
  beforeEach(() => {
    jest.mocked(useHomePage).mockReset().mockReturnValue({
      activities: [],
      error: undefined,
      isFeedLoading: false,
      hasLoadedActivities: true,
      isLastPage: true,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
      isError: false,
    });
  });

  it('loads and displays only the favorites feed', async () => {
    await renderWithProviders(<FavoriteActivitiesPage />);

    expect(useHomePage).toHaveBeenCalledWith(HOME_FEED.favorites);
    expect(screen.getByTestId('empty-favorite-activities')).toBeOnTheScreen();
  });

  it('renders the activity list when favorites are available', async () => {
    jest.mocked(useHomePage).mockReturnValue({
      activities: [{ id: 'favorite-1' }] as ReturnType<typeof useHomePage>['activities'],
      error: undefined,
      isFeedLoading: false,
      hasLoadedActivities: true,
      isLastPage: true,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
      isError: false,
    });
    await renderWithProviders(<FavoriteActivitiesPage />);

    expect(screen.getByTestId('favorite-activity-list')).toBeOnTheScreen();
  });
});
