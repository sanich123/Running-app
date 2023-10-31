import { screen, userEvent } from '@testing-library/react-native';

import ActivityPauseBtn from './activity-pause-btn';
import { LANGUAGES, STATUSES } from '../../constants/enums';
import { LANGUAGE } from '../../constants/languages/languages';
import { changeLanguage } from '../../redux/language/language';
import { setActivityStatus } from '../../redux/location/location';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Activity pause btn', () => {
  it('should render resume, when paused', () => {
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    renderWithProviders(<ActivityPauseBtn />, { store: mockStore });
    expect(screen.getByText(LANGUAGE.english.activity.controlBtns.resume)).toBeDefined();
  });
  it('should correctly interract with the user', async () => {
    jest.useFakeTimers();
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    renderWithProviders(<ActivityPauseBtn />, { store: mockStore });
    const resumeBtn = screen.getByText(LANGUAGE.english.activity.controlBtns.resume);
    await userEvent.press(resumeBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.continued);
  });
  it('should render in russian, when changed language', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    renderWithProviders(<ActivityPauseBtn />, { store: mockStore });
    expect(screen.getByText(LANGUAGE.russian.activity.controlBtns.resume)).toBeDefined();
  });
});
