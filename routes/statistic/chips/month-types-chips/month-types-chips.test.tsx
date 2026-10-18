import { fireEvent, screen } from '@testing-library/react-native';
import { http } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import MonthTypesChips from './month-types-chips';

const setSelectedType = jest.fn();
const props = { userId: MOCK_SERVER_IDS.userId, year: '2026', month: '7', selectedType: 'all', setSelectedType };

describe('MonthTypesChips', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.english)));
  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-month`, loadingResponse));
    await renderWithProviders(<MonthTypesChips {...props} />);
    expect(screen.getByTestId('month-types-loading')).toBeOnTheScreen();
  });
  it('renders server sport types and changes selection', async () => {
    await renderWithProviders(<MonthTypesChips {...props} />);
    fireEvent.press(await screen.findByText('walk'));
    expect(setSelectedType).toHaveBeenCalledWith('walk');
  });
  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-month`, errorResponse));
    await renderWithProviders(<MonthTypesChips {...props} />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
