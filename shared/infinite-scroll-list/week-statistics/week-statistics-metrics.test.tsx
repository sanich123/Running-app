import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { WEEK_STATISTICS } from './const';
import WeekStatisticsMetric from './week-statistics-metrics';

const props = { title: 'Activities', metrics: '7' };

describe('WeekStatisticsMetric', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.english)));
  it('renders loading state', async () => {
    await renderWithProviders(<WeekStatisticsMetric {...props} isLoading isSuccess={false} isError={false} />);
    expect(screen.queryByText(props.metrics)).not.toBeOnTheScreen();
  });
  it('renders success state', async () => {
    await renderWithProviders(<WeekStatisticsMetric {...props} isLoading={false} isSuccess isError={false} />);
    expect(screen.getByText(props.metrics)).toBeOnTheScreen();
  });
  it('renders error state', async () => {
    await renderWithProviders(<WeekStatisticsMetric {...props} isLoading={false} isSuccess={false} isError />);
    expect(screen.getByText(WEEK_STATISTICS.english.error)).toBeOnTheScreen();
  });
});
