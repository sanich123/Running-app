import { screen } from '@testing-library/react-native';
import { EMPTY_ACTIVITIES_LIST } from './const';
import EmptyActivitiesList from './empty-activities-list';
import { renderWithProviders } from '@T/utils/test-utils';
import { mockStore } from '@T/utils/mock-store';
import { changeLanguage } from '@R/slices/language/language';
import { LANGUAGES } from '@const/enums';

describe('Empty activities list', () => {
  it('should contain proper information in english', () => {
    renderWithProviders(<EmptyActivitiesList />, { store: mockStore });
    expect(screen.getByText(EMPTY_ACTIVITIES_LIST.russian.emptyActivities)).toBeOnTheScreen();
  });
  it('should contain proper information in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<EmptyActivitiesList />, { store: mockStore });
    expect(screen.getByText(EMPTY_ACTIVITIES_LIST.english.emptyActivities)).toBeOnTheScreen();
  });
});
