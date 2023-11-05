import { screen, userEvent } from '@testing-library/react-native';

import ActivityStartBtn from './activity-start-btn';
import { STATUSES } from '../../constants/enums';
import { setActivityStatus, setDistance, setDuration, setLocationsFromBackground } from '../../redux/location/location';
import { MOCK_DISTANCE, MOCK_DURATION, MOCK_LOCATION, MOCK_SPEED } from '../../tests/mocks/mock-location';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
describe('Activity start btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ActivityStartBtn />, { store: mockStore });
    expect(screen.getByText(/run/i)).toBeOnTheScreen();
  });
  it('should correctly change from initial to started status', async () => {
    renderWithProviders(<ActivityStartBtn />, { store: mockStore });
    const startBtn = screen.getByText(/run/i);
    await userEvent.press(startBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.started);
  });
  it('should correctly change from started to paused status', async () => {
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    renderWithProviders(<ActivityStartBtn />, { store: mockStore });
    const startBtn = screen.getByTestId(/startButton/i);
    await userEvent.press(startBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.paused);
  });

  it('should correctly change from paused to initial status', async () => {
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    renderWithProviders(<ActivityStartBtn />, { store: mockStore });
    expect(screen.getByText(/finish/i)).toBeOnTheScreen();
    const startBtn = screen.getByTestId(/startButton/i);
    await userEvent.press(startBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.initial);
  });
  it('should correctly dispatch saveFinishedActivity', async () => {
    mockStore.dispatch(setDuration(MOCK_DURATION));
    mockStore.dispatch(setDistance(MOCK_DISTANCE));
    mockStore.dispatch(setLocationsFromBackground(MOCK_LOCATION));
    renderWithProviders(<ActivityStartBtn />, { store: mockStore });
    const startBtn = screen.getByTestId(/startButton/i);
    await userEvent.press(startBtn);
    expect(mockStore.getState().location.finishedActivity.distance).toEqual(MOCK_DISTANCE);
    expect(mockStore.getState().location.finishedActivity.duration).toEqual(MOCK_DURATION);
    expect(mockStore.getState().location.finishedActivity.speed).toEqual(MOCK_SPEED);
    expect(mockStore.getState().location.finishedActivity.locations).toHaveLength(1);
  });
});
