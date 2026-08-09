import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from '@const/activity-save-btn';
import { LANGUAGES, ROUTES } from '@const/enums';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import {
  saveDescription,
  saveEmotion,
  saveSport,
  saveTitle,
} from '@R/slices/actitivity-additional-info/activity-additional-info';
import { saveFinishedActivity, setActivityId } from '@R/slices/activity/activity';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/language/language';
import {
  setIsManualAdding,
  setManualDistance,
  setManualHours,
  setManualMinutes,
  setIsEditingActivity,
} from '@R/slices/manual-activity/manual-activity';
import { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';
import { MOCK_LOCATION, MOCK_DURATION, MOCK_SPEED, MOCK_DISTANCE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivitySaveBtn from './save-btn';

const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
  useGlobalSearchParams: () => ({ id: 'someId' }),
}));

describe('Activity save btn', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockReplace.mockClear();
  });

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

  it('returns to the previous screen after saving a manual activity', async () => {
    mockStore.dispatch(setUserId('someUserId'));
    mockStore.dispatch(setIsManualAdding(true));
    mockStore.dispatch(setManualDistance(5));
    mockStore.dispatch(setManualHours(1));
    mockStore.dispatch(setManualMinutes(20));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });

  it('returns to the feed after saving a tracked activity', async () => {
    mockStore.dispatch(setUserId('someUserId'));
    mockStore.dispatch(setIsManualAdding(false));
    mockStore.dispatch(
      saveFinishedActivity({
        locations: [MOCK_LOCATION],
        duration: MOCK_DURATION,
        speed: MOCK_SPEED,
        distance: MOCK_DISTANCE,
        kilometresSplit: [],
      }),
    );
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.root));
  });

  it('returns to the feed after an unsent tracked activity fails to save', async () => {
    mockStore.dispatch(setUserId('someWrongUserId'));
    mockStore.dispatch(setIsManualAdding(false));
    mockStore.dispatch(
      saveFinishedActivity({
        locations: [MOCK_LOCATION],
        duration: MOCK_DURATION,
        speed: MOCK_SPEED,
        distance: MOCK_DISTANCE,
        kilometresSplit: [],
      }),
    );
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.root));
  });

  it('returns to the activity after successfully editing it', async () => {
    server.use(http.patch(`${BASE_URL}/activity/activity-id`, () => HttpResponse.json({ id: 'activity-id' })));
    mockStore.dispatch(setUserId('someUserId'));
    mockStore.dispatch(setIsManualAdding(true));
    mockStore.dispatch(setIsEditingActivity(true));
    mockStore.dispatch(setManualDistance(5));
    mockStore.dispatch(setManualHours(1));
    mockStore.dispatch(setManualMinutes(20));
    mockStore.dispatch(setActivityId('activity-id'));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });
});
