import { screen, userEvent } from '@testing-library/react-native';

import * as auth from '../../auth/context/auth-context';
import ActivitySaveBtn from '../../components/activity-save-btn/activity-save-btn';
import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from '../../components/activity-save-btn/const';
import { EMOTIONS_BTNS_VALUES } from '../../components/emotion-btns/const';
import { SPORTS_BTNS_VALUES } from '../../components/sports-btns/const';
import { LANGUAGES } from '../../constants/enums';
import {
  saveDescription,
  saveEmotion,
  saveFinishedActivity,
  saveSport,
  saveTitle,
} from '../../redux/activity/activity';
import { changeLanguage } from '../../redux/language/language';
import { MOCK_DISTANCE, MOCK_DURATION, MOCK_LOCATION, MOCK_SPEED } from '../mocks/mock-location';
import { USER_AUTH_MOCKS } from '../mocks/use-auth';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Activity save btn', () => {
  it('should correctly renders in english', () => {
    renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_SAVE_BTN.english.save)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_SAVE_BTN.russian.save)).toBeOnTheScreen();
  });
  it('should correctly change global state', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    const saveBtn = screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID);
    expect(mockStore.getState().activity.isDisabledWhileSending).toEqual(false);
    await userEvent.press(saveBtn);
    expect(mockStore.getState().activity.isNeedToResetInputs).toEqual(true);
  });
  it('should correctly change global state after successfully sending activity', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    mockStore.dispatch(
      saveFinishedActivity({
        locations: [MOCK_LOCATION],
        duration: MOCK_DURATION,
        speed: MOCK_SPEED,
        distance: MOCK_DISTANCE,
        kilometresSplit: [],
      }),
    );
    mockStore.dispatch(saveTitle('Some title'));
    mockStore.dispatch(saveDescription('Some description'));
    mockStore.dispatch(saveSport(SPORTS_BTNS_VALUES.run));
    mockStore.dispatch(saveEmotion(EMOTIONS_BTNS_VALUES.fucked));
    renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    const saveBtn = screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID);
    expect(mockStore.getState().activity.isDisabledWhileSending).toEqual(false);
    await userEvent.press(saveBtn);
    expect(mockStore.getState().activity.isNeedToResetInputs).toEqual(true);
    expect(mockStore.getState().activity.additionalInfo.description).toEqual('');
    expect(mockStore.getState().activity.additionalInfo.title).toEqual('');
    expect(mockStore.getState().activity.additionalInfo.sport).toEqual(SPORTS_BTNS_VALUES.run);
    expect(mockStore.getState().activity.additionalInfo.emotion).toEqual(EMOTIONS_BTNS_VALUES.normal);
  });
});
