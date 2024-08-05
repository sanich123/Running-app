import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { HOME_ACTIVITY_FULL_VIEW_TEST_ID, HOME_ACTIVITY_FULL_VIEW } from './const';
import Metrics from './metrics';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    id: 'someActivityId',
  }),
}));

describe('Home activity full view', () => {
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<Metrics />, { store: mockStore });
    expect(screen.getByTestId(HOME_ACTIVITY_FULL_VIEW_TEST_ID)).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.distance)).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.averagePace)).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.movingTime)).toBeOnTheScreen();
    expect(await screen.findByText('00:58:34')).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.elevationGain)).toBeOnTheScreen();
    expect(await screen.findByText('21 m')).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<Metrics />, { store: mockStore });
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.russian.distance)).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.russian.averagePace)).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.russian.movingTime)).toBeOnTheScreen();
    expect(await screen.findByText('00:58:34')).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.russian.elevationGain)).toBeOnTheScreen();
    expect(await screen.findByText(new RegExp(`21 ${HOME_ACTIVITY_FULL_VIEW.russian.m}`))).toBeOnTheScreen();
  });
});
