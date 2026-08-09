import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES, STATUSES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { setActivityStatus, setDuration, setDistance, setLocationsFromBackground } from '@R/slices/location/location';
import { MOCK_DURATION, MOCK_DISTANCE, MOCK_LOCATION, MOCK_SPEED } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { ACTIVITY_START_BTN, ACTIVITY_START_BTN_TEST_ID } from './const';
import ActivityStartBtn from './start-btn';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));
describe('Activity start btn', () => {
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_START_BTN.english.start)).toBeOnTheScreen();
  });

  it('should correctly change from initial to started status', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />, { store: mockStore });
    const startBtn = screen.getByText(ACTIVITY_START_BTN.english.start);
    await userEvent.press(startBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.started);
  });
  it('should correctly change from started to paused status', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />, { store: mockStore });
    const startBtn = screen.getByTestId(ACTIVITY_START_BTN_TEST_ID);
    await userEvent.press(startBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.paused);
  });

  it('should correctly change from paused to initial status', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />, { store: mockStore });
    const startBtn = screen.getByTestId(ACTIVITY_START_BTN_TEST_ID);
    await userEvent.press(startBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.initial);
  });

  it('opens manual activity after finishing the recording', async () => {
    mockPush.mockClear();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_START_BTN_TEST_ID));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.manualActivity}`);
  });
  it('should correctly dispatch saveFinishedActivity', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setDuration(MOCK_DURATION));
    mockStore.dispatch(setDistance(MOCK_DISTANCE));
    mockStore.dispatch(setLocationsFromBackground(MOCK_LOCATION));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />, { store: mockStore });
    const startBtn = screen.getByTestId(ACTIVITY_START_BTN_TEST_ID);
    await userEvent.press(startBtn);
    expect(mockStore.getState().activity.finishedActivity.distance).toEqual(MOCK_DISTANCE);
    expect(mockStore.getState().activity.finishedActivity.duration).toEqual(MOCK_DURATION);
    expect(mockStore.getState().activity.finishedActivity.speed).toEqual(MOCK_SPEED);
    expect(mockStore.getState().activity.finishedActivity.locations).toHaveLength(1);
  });
  it('should correctly renders finish in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation={false} />, { store: mockStore });
  });
  it('should correctly renders start in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setActivityStatus(STATUSES.initial));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation={false} />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_START_BTN.russian.start)).toBeOnTheScreen();
  });
  it('should correctly renders stop icon', async () => {
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation={false} />, { store: mockStore });
    expect(screen.getByTestId(new RegExp(`${ACTIVITY_START_BTN_TEST_ID}`))).toBeOnTheScreen();
  });
});
