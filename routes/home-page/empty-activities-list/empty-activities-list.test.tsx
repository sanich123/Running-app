import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { EMPTY_ACTIVITIES_LIST } from './const';
import EmptyActivitiesList from './empty-activities-list';

describe('Empty activities list', () => {
  it('should contain proper information in english', async () => {
    await renderWithProviders(<EmptyActivitiesList />, { store: mockStore });
    expect(screen.getByText(EMPTY_ACTIVITIES_LIST.russian.emptyActivities)).toBeOnTheScreen();
  });
  it('should contain proper information in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<EmptyActivitiesList />, { store: mockStore });
    expect(screen.getByText(EMPTY_ACTIVITIES_LIST.english.emptyActivities)).toBeOnTheScreen();
  });
});
