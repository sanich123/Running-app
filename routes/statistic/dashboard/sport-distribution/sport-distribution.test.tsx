import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { DASHBOARD_LABELS } from '../const';
import SportDistribution from './sport-distribution';

describe('SportDistribution', () => {
  it('changes the selected sport when a filter is pressed', async () => {
    const onSportChange = jest.fn();
    const totals = { distance: 2_000, duration: 600, activities: 2, steps: 0, caloriesActive: 0 };

    await renderWithProviders(
      <SportDistribution
        sports={{ run: { distance: 1_000, duration: 300, activities: 1, steps: 0, caloriesActive: 0 } }}
        totals={totals}
        sportOptions={[
          { key: 'all', icon: 'chart-donut' },
          { key: 'run', icon: 'run' },
        ]}
        selectedSport="all"
        metric="distance"
        labels={DASHBOARD_LABELS[LANGUAGES.english]}
        language={LANGUAGES.english}
        onSportChange={onSportChange}
      />,
    );
    fireEvent.press(screen.getByTestId('dashboard-sport-chip-run'));

    expect(onSportChange).toHaveBeenCalledWith('run');
  });
});
