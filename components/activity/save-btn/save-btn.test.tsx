import { screen, userEvent } from '@testing-library/react-native';
import { EMOTIONS_BTNS_VALUES } from '@C/save-activity-page/emotion-btns/const';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { LANGUAGES } from '@const/enums';
import {
  saveDescription,
  saveEmotion,
  saveSport,
  saveTitle,
} from '@R/slices/actitivity-additional-info/activity-additional-info';
import { saveFinishedActivity } from '@R/slices/activity/activity';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/language/language';
import { MOCK_LOCATION, MOCK_DURATION, MOCK_SPEED, MOCK_DISTANCE } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from './const';
import ActivitySaveBtn from './save-btn';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useGlobalSearchParams: () => ({ id: 'someId' }),
}));

describe('Activity save btn', () => {
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_SAVE_BTN.english.save)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_SAVE_BTN.russian.save)).toBeOnTheScreen();
  });
  it('should correctly change global state', async () => {
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    const saveBtn = screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID);
    expect(mockStore.getState().activity.isDisabledWhileSending).toEqual(false);
    await userEvent.press(saveBtn);
  });
  it('should correctly change global state after successfully sending activity', async () => {
    mockStore.dispatch(setUserId('someUserId'));
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
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    const saveBtn = screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID);
    expect(mockStore.getState().activity.isDisabledWhileSending).toEqual(false);
    await userEvent.press(saveBtn);
    expect(mockStore.getState().additionalInfoActivity.title).toEqual('');
    expect(mockStore.getState().additionalInfoActivity.sport).toEqual(SPORTS_BTNS_VALUES.run);
    expect(mockStore.getState().additionalInfoActivity.emotion).toEqual(EMOTIONS_BTNS_VALUES.normal);
  });
});
