import { screen } from '@testing-library/react-native';
import { http } from 'msw';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import CalendarActivities from './calendar';

jest.mock('../calendar-date-with-activity/calendar-date-with-activity', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="calendar-active-date" />;
});

const props = { userId: MOCK_SERVER_IDS.userId, year: '2026', month: '7', selectedType: 'all' };

describe('CalendarActivities', () => {
  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-month`, loadingResponse));
    await renderWithProviders(<CalendarActivities {...props} />);
    expect(screen.getByTestId('calendar-loading')).toBeOnTheScreen();
  });
  it('renders server activities', async () => {
    await renderWithProviders(<CalendarActivities {...props} />);
    expect(await screen.findAllByTestId('calendar-active-date')).not.toHaveLength(0);
  });
  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-month`, errorResponse));
    await renderWithProviders(<CalendarActivities {...props} />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
