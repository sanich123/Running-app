import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ChooseMetricsBtns from './choose-metrics-btns';
import { getMetricsBtnsValues } from '../const';
import { ChooseMetricsBtnsValues } from '../types';

describe('choose metrics btns', () => {
  it('changes the metric displayed on the chart', async () => {
    const setChartValue = jest.fn();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <ChooseMetricsBtns chartValue={ChooseMetricsBtnsValues.distance} setChartValue={setChartValue} />,
    );
    const duration = getMetricsBtnsValues(LANGUAGES.english)[2];
    fireEvent.press(screen.getByText(duration.label));
    expect(setChartValue).toHaveBeenCalledWith(duration.value);
  });
});
