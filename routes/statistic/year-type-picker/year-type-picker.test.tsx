import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { scrollYearsByWheel } from './util';
import YearTypePicker from './year-type-picker';

const availableYearsAndTypes = [
  { year: '2026', types: ['run', 'walk'] },
  { year: '2025', types: ['bike'] },
];

describe('year type picker', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.english)));

  it('changes year and falls back to an available sport', async () => {
    const setSelectedYear = jest.fn();
    const setSelectedType = jest.fn();
    await renderWithProviders(
      <YearTypePicker
        setSelectedYear={setSelectedYear}
        setSelectedType={setSelectedType}
        selectedYear={2026}
        selectedType="run"
        availableYearsAndTypes={availableYearsAndTypes}
      />,
    );
    fireEvent.press(screen.getByText('2025'));
    expect(setSelectedYear).toHaveBeenCalledWith(2025);
    expect(setSelectedType).toHaveBeenCalledWith('bike');
  });

  it('changes the selected sport', async () => {
    const setSelectedType = jest.fn();
    await renderWithProviders(
      <YearTypePicker
        setSelectedYear={jest.fn()}
        setSelectedType={setSelectedType}
        selectedYear={2026}
        selectedType="run"
        availableYearsAndTypes={availableYearsAndTypes}
      />,
    );
    fireEvent.press(screen.getByText('walk'));
    expect(setSelectedType).toHaveBeenCalledWith('walk');
  });

  it('moves the years list horizontally when the mouse wheel is used', () => {
    const currentTarget = { clientWidth: 120, scrollLeft: 0, scrollWidth: 360 };

    scrollYearsByWheel({ currentTarget, deltaY: 80 });

    expect(currentTarget.scrollLeft).toBe(80);
  });

  it('ignores a wheel event when there is no horizontal overflow', () => {
    const currentTarget = { clientWidth: 120, scrollLeft: 0, scrollWidth: 120 };

    scrollYearsByWheel({ currentTarget, deltaY: 80 });

    expect(currentTarget.scrollLeft).toBe(0);
  });
});
