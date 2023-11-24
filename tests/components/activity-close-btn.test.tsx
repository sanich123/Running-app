import { screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

import ActivityCloseBtn from '../../components/activity-close-btn/activity-close-btn';
import { ACTIVITY_CLOSE_BTN } from '../../components/activity-close-btn/const';
import { LANGUAGES, STATUSES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { setDuration } from '../../redux/location/location';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

jest.spyOn(Alert, 'alert');

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

describe('Activity close btn', () => {
  it('should correctly renders in english', () => {
    renderWithProviders(<ActivityCloseBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_CLOSE_BTN.english.btnText)).toBeDefined();
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<ActivityCloseBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_CLOSE_BTN.russian.btnText)).toBeDefined();
  });
  it('should correctly show alert message, when duration is greater than 0', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setDuration(10000));
    renderWithProviders(<ActivityCloseBtn />, { store: mockStore });
    const closeBtn = screen.getByText(ACTIVITY_CLOSE_BTN.english.btnText);
    await userEvent.press(closeBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.paused);
    expect(Alert.alert).toHaveBeenCalled();
  });
});
