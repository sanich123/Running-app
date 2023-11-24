import { screen, userEvent } from '@testing-library/react-native';

import ActivityPauseBtn from '../../components/activity-pause-btn/activity-pause-btn';
import { ACTIVITY_PAUSE_BTN } from '../../components/activity-pause-btn/const';
import { LANGUAGES, STATUSES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { setActivityStatus } from '../../redux/location/location';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

describe('Activity pause btn', () => {
  it('should render resume, when paused', () => {
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    renderWithProviders(<ActivityPauseBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_PAUSE_BTN.english.resume)).toBeOnTheScreen();
  });
  it('should correctly interract with the user', async () => {
    jest.useFakeTimers();
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    renderWithProviders(<ActivityPauseBtn />, { store: mockStore });
    const resumeBtn = screen.getByText(ACTIVITY_PAUSE_BTN.english.resume);
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
