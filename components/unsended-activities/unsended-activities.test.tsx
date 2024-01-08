import { saveUnsendedActivity, setIsHaveUnsyncedActivity } from '@R/activity/activity';
import { changeLanguage } from '@R/language/language';
import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { UNSENDED_ACTIVITIES } from './const';
import UnsendedActivitiesIndicator from './unsended-activities-indicator';

describe('Unsended activities indicator', () => {
  // it('should correctly renders when an error in english, when isHaveUnsyncedActivity and unsyncedActivities.length > 0', async () => {
  //   mockStore.dispatch(
  //     saveUnsendedActivity({
  //       body: { MOCK_ACTIVITY },
  //       id: 'someWrongUserId',
  //     }),
  //   );
  //   mockStore.dispatch(setIsHaveUnsyncedActivity(true));
  //   renderWithProviders(<UnsendedActivitiesIndicator />, { store: mockStore });
  //   expect(screen.getByText(new RegExp(UNSENDED_ACTIVITIES.english.isLoading))).toBeOnTheScreen();
  //   expect(await screen.findByText(new RegExp(UNSENDED_ACTIVITIES.english.error))).toBeOnTheScreen();
  // });
  // it('should correctly renders when an error in russian, when isHaveUnsyncedActivity and unsyncedActivities.length > 0', async () => {
  //   mockStore.dispatch(refreshUnsendedActivitiesList([]));
  //   mockStore.dispatch(
  //     saveUnsendedActivity({
  //       body: { MOCK_ACTIVITY },
  //       id: 'someWrongUserId',
  //     }),
  //   );
  //   mockStore.dispatch(setIsHaveUnsyncedActivity(true));
  //   mockStore.dispatch(changeLanguage(LANGUAGES.russian));
  //   renderWithProviders(<UnsendedActivitiesIndicator />, { store: mockStore });
  //   expect(screen.getByText(new RegExp(UNSENDED_ACTIVITIES.russian.isLoading))).toBeOnTheScreen();
  //   // expect(await screen.findByText(new RegExp(UNSENDED_ACTIVITIES.russian.error))).toBeOnTheScreen();
  // });
  it('should correctly renders when a success in english, when isHaveUnsyncedActivity and unsyncedActivities.length > 0', async () => {
    mockStore.dispatch(
      saveUnsendedActivity({
        body: { MOCK_ACTIVITY },
        id: 'someUserId',
      }),
    );
    mockStore.dispatch(
      saveUnsendedActivity({
        body: { MOCK_ACTIVITY },
        id: 'someUserId',
      }),
    );
    mockStore.dispatch(setIsHaveUnsyncedActivity(true));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<UnsendedActivitiesIndicator />, { store: mockStore });
    expect(screen.getByText(new RegExp(UNSENDED_ACTIVITIES.english.isLoading))).toBeOnTheScreen();
    expect(await screen.findByText(new RegExp(UNSENDED_ACTIVITIES.english.success))).toBeOnTheScreen();
  });
});
