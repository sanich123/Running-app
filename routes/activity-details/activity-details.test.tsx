import { type ReactElement, type ReactNode } from 'react';
import { act, screen, userEvent } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Platform, StyleSheet } from 'react-native';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { LANGUAGES } from '@const/enums';
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
import { ACTIVITY_ACTIONS_MENU } from './activity-actions-menu/const';
import ActivityDetails from './activity-details';
import { REPORT_CONTENT_COPY } from '../../shared/moderation/report-content-dialog/const';

const mockHeaderRight: { current?: () => ReactNode } = {};
const mockPush = jest.fn();
const originalPlatformOS = Platform.OS;

jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  const { Fragment } = React;
  const { Pressable, Text, View } = jest.requireActual('react-native');
  const Toolbar = Object.assign(({ children }: { children?: ReactNode }) => React.createElement(View, null, children), {
    Menu: ({ children, accessibilityLabel }: { children?: ReactNode; accessibilityLabel?: string }) =>
      React.createElement(View, { accessibilityLabel }, children),
    MenuAction: ({ children, onPress }: { children?: ReactNode; onPress?: () => void }) =>
      React.createElement(
        Pressable,
        { accessibilityRole: 'button', onPress },
        React.createElement(Text, null, children),
      ),
  });

  return {
    Stack: {
      Screen: ({ options, children }: { options: { headerRight?: () => ReactNode }; children?: ReactNode }) => {
        mockHeaderRight.current = options.headerRight;
        return React.createElement(Fragment, null, children);
      },
      Toolbar,
    },
    useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.activityId }),
    usePathname: () => `/activity/${MOCK_SERVER_IDS.activityId}`,
    useRouter: () => ({ push: mockPush, back: jest.fn() }),
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
    mockPush.mockClear();
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOS });
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

  it('shows an actions menu in the Android header for the owner and another user', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setMockUserId(MOCK_SERVER_ACTIVITY.userId));

    await renderWithProviders(<ActivityDetails />);
    await screen.findByTestId('full-view-card');
    expect((mockHeaderRight.current?.() as ReactElement).type).toBe(ActivityActionsMenu);

    await act(async () => {
      mockStore.dispatch(setMockUserId('external-viewer'));
    });
    expect((mockHeaderRight.current?.() as ReactElement).type).toBe(ActivityActionsMenu);
  });

  it('uses the native iOS toolbar menu for activity actions', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setMockUserId(MOCK_SERVER_ACTIVITY.userId));
    const user = userEvent.setup();

    await renderWithProviders(<ActivityDetails />);
    await screen.findByTestId('full-view-card');

    expect(screen.getByLabelText('Действия с тренировкой')).toBeOnTheScreen();
    await user.press(screen.getByText('Редактировать'));
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: expect.stringContaining('manual-activity'),
        params: expect.objectContaining({ mode: 'edit' }),
      }),
    );

    await user.press(screen.getByText('Удалить'));
    expect(screen.getByText('Удалить активность?')).toBeOnTheScreen();
  });

  it('offers reporting in the native iOS activity menu for another user', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setMockUserId('external-viewer'));
    const user = userEvent.setup();

    await renderWithProviders(<ActivityDetails />);
    await screen.findByTestId('full-view-card');

    expect(screen.getByLabelText(ACTIVITY_ACTIONS_MENU[LANGUAGES.russian].accessibilityLabel)).toBeOnTheScreen();
    await user.press(screen.getByText(ACTIVITY_ACTIONS_MENU[LANGUAGES.russian].report));
    expect(screen.getAllByText(REPORT_CONTENT_COPY[LANGUAGES.russian].title)).toHaveLength(2);
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/activity/activityId/${MOCK_SERVER_IDS.activityId}`, errorResponse));
    await renderWithProviders(<ActivityDetails />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
