import { screen, userEvent } from '@testing-library/react-native';
import { ToastAndroid } from 'react-native';

import ActivitySaveBtn from './activity-save-btn';
import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from './const';
import * as auth from '../../auth/context/auth-context';
import { LANGUAGES } from '../../constants/enums';
import { saveDescription, saveEmotion, saveSport, saveTitle } from '../../redux/activity/activity';
import { changeLanguage } from '../../redux/language/language';
import { saveFinishedActivity } from '../../redux/location/location';
import { MOCK_DISTANCE, MOCK_DURATION, MOCK_LOCATION, MOCK_SPEED } from '../../tests/mocks/mock-location';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.spyOn(ToastAndroid, 'show');
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
    mockStore.dispatch(saveSport('run'));
    mockStore.dispatch(saveEmotion('good'));
    renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    const saveBtn = screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID);
    expect(mockStore.getState().activity.isDisabledWhileSending).toEqual(false);
    await userEvent.press(saveBtn);
    expect(mockStore.getState().activity.isNeedToResetInputs).toEqual(true);
    expect(mockStore.getState().activity.additionalInfo.description).toEqual('');
    expect(mockStore.getState().activity.additionalInfo.title).toEqual('');
    expect(mockStore.getState().activity.additionalInfo.sport).toEqual('');
    expect(mockStore.getState().activity.additionalInfo.emotion).toEqual('');
  });
});
