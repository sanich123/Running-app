import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { MONTH_STATISTICS } from './const';
import MonthStatisticsMetrics from './month-metric';

const props = { title: 'Distance', metric: '73', postfix: 'km' };

describe('MonthStatisticsMetrics', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.english)));
  it('renders loading state', async () => {
    await renderWithProviders(<MonthStatisticsMetrics {...props} isLoading isSuccess={false} isError={false} />);
    expect(screen.queryByText(props.metric)).not.toBeOnTheScreen();
  });

  it('renders success state', async () => {
    await renderWithProviders(<MonthStatisticsMetrics {...props} isLoading={false} isSuccess isError={false} />);
    expect(screen.getByText(props.metric)).toBeOnTheScreen();
    expect(screen.getByText(props.postfix)).toBeOnTheScreen();
  });

  it('renders error state', async () => {
    await renderWithProviders(<MonthStatisticsMetrics {...props} isLoading={false} isSuccess={false} isError />);
    expect(screen.getByText(MONTH_STATISTICS.english.error)).toBeOnTheScreen();
  });
});
