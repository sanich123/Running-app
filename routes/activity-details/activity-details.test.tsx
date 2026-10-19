import { Suspense, type ReactElement, type ReactNode } from 'react';
import { act, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { StyleSheet } from 'react-native';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { runichApi } from '@R/runich-api/runich-api';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { MOCK_SERVER_ACTIVITY, MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityActionsMenu from './activity-actions-menu/activity-actions-menu';
import ActivityDetails from './activity-details';

const mockHeaderRight: { current?: () => ReactNode } = {};

jest.mock('expo-router', () => {
  return {
    Stack: {
      Screen: ({ options }: { options: { headerRight?: () => ReactNode } }) => {
        mockHeaderRight.current = options.headerRight;
        return null;
      },
    },
    useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.activityId }),
    usePathname: () => `/activity/${MOCK_SERVER_IDS.activityId}`,
    useRouter: () => ({ push: jest.fn() }),
  };
});
jest.mock('./activity-actions-menu/activity-actions-menu', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="activity-actions-menu" /> };
});
jest.mock('@S/card/activity-card/activity-card', () => {
  const { Text, View } = jest.requireActual('react-native');
  return ({
    activity,
    isShowDescription,
  }: {
    activity?: { description?: string | null };
    isShowDescription?: boolean;
  }) => (
    <View testID="full-view-card">
      {isShowDescription && activity?.description ? <Text>{activity.description}</Text> : null}
    </View>
  );
});
jest.mock('./metrics/metrics', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="full-view-metrics" />;
});
jest.mock('./kilometre-split-table/kilometre-split-table', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="full-view-kilometre-split-table" />;
});

describe('ActivityDetails', () => {
  beforeEach(() => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setMockUserId('viewer-1'));
  });

  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/activity/activityId/${MOCK_SERVER_IDS.activityId}`, loadingResponse));
    await renderWithProviders(<ActivityDetails />);
    expect(screen.getByTestId('homeActivityIndicator')).toBeOnTheScreen();
  });

  it('renders activity returned by the server', async () => {
    await renderWithProviders(<ActivityDetails />);
    expect(await screen.findByTestId('full-view-card')).toBeOnTheScreen();
    expect(screen.getByText(MOCK_SERVER_ACTIVITY.description)).toBeOnTheScreen();
    expect(screen.getByTestId('full-view-metrics')).toBeOnTheScreen();
    expect(StyleSheet.flatten(screen.getByTestId('cross-platform-scroll-view').props.contentContainerStyle)).toEqual(
      expect.not.objectContaining({ paddingHorizontal: 12 }),
    );
  });

  it('lets the splits card fill the content width on mobile web', async () => {
    server.use(
      http.get(`${BASE_URL}/activity/activityId/${MOCK_SERVER_IDS.activityId}`, () =>
        HttpResponse.json({
          ...MOCK_SERVER_ACTIVITY,
          kilometresSplit: [MOCK_ACTIVITY.kilometresSplit[0]],
        }),
      ),
    );

    await renderWithProviders(<ActivityDetails />);

    expect(await screen.findByTestId('activity-kilometre-splits-card')).toBeOnTheScreen();
    expect(StyleSheet.flatten(screen.getByTestId('activity-kilometre-splits-card').props.style)).toEqual(
      expect.objectContaining({ width: '100%', maxWidth: MAX_MOBILE_WIDTH }),
    );
  });

  it('shows the activity actions menu in the header only for the activity owner', async () => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setMockUserId(MOCK_SERVER_ACTIVITY.userId));

    await renderWithProviders(<ActivityDetails />);
    await screen.findByTestId('full-view-card');
    expect((mockHeaderRight.current?.() as ReactElement).type).toBe(ActivityActionsMenu);

    await act(async () => {
      mockStore.dispatch(setMockUserId('external-viewer'));
    });
    expect((mockHeaderRight.current?.() as ReactElement).type).toBe(Suspense);
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/activity/activityId/${MOCK_SERVER_IDS.activityId}`, errorResponse));
    await renderWithProviders(<ActivityDetails />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
