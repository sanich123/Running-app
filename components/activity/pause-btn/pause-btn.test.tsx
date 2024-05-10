import { changeLanguage } from '@R/language/language';
import { setActivityStatus } from '@R/location/location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { STATUSES, LANGUAGES } from '@const/enums';
import { screen, userEvent } from '@testing-library/react-native';

import { ACTIVITY_PAUSE_BTN } from './const';
import ActivityPauseBtn from './pause-btn';

describe('Activity pause btn', () => {
  it('should render resume, when paused', () => {
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    renderWithProviders(<ActivityPauseBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_PAUSE_BTN.russian.resume)).toBeOnTheScreen();
  });
  it('should correctly interract with the user', async () => {
    jest.useFakeTimers();
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    renderWithProviders(<ActivityPauseBtn />, { store: mockStore });
    const resumeBtn = screen.getByText(ACTIVITY_PAUSE_BTN.russian.resume);
    await userEvent.press(resumeBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.continued);
  });
  it('should render in russian, when changed language', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    renderWithProviders(<ActivityPauseBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_PAUSE_BTN.russian.resume)).toBeDefined();
  });
});
