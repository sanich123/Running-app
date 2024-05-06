import { screen } from '@testing-library/react-native';

import { EMPTY_ACTIVITIES_LIST } from './const';
import EmptyActivitiesList from './empty-activities-list';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

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
