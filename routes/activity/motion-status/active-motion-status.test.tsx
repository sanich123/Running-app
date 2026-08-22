import { act, screen } from '@testing-library/react-native';
import { Accelerometer } from 'expo-sensors';
import { LANGUAGES } from '@const/enums';
import { resetLocationSlice } from '@R/slices/location/location';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { getPedometerActivityData } from '@U/pedometer/pedometer';
import ActiveMotionStatus from './active-motion-status';
import { ACTIVITY_MOTION_STATUS } from './const';

jest.mock('@U/pedometer/pedometer', () => ({
  getPedometerActivityData: jest.fn(),
}));

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

type AccelerometerListener = (data: AccelerometerData) => void;

const addListenerMock = Accelerometer.addListener as jest.Mock;
const getPedometerActivityDataMock = getPedometerActivityData as jest.Mock;

describe('Activity-motion-status', () => {
  let listener: AccelerometerListener;
  let dateNowSpy: jest.SpiedFunction<typeof Date.now>;
  let currentTimestamp = 0;

  beforeEach(() => {
    jest.useRealTimers();
    mockStore.dispatch(resetLocationSlice());
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    getPedometerActivityDataMock.mockReturnValue({ steps: 0, samples: [] });
    addListenerMock.mockImplementation((callback: AccelerometerListener) => {
      listener = callback;
      return { remove: jest.fn() };
    });
    currentTimestamp = 0;
    dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => currentTimestamp);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
    jest.useFakeTimers();
  });

  it('shows that the resting conclusion is based on the accelerometer when other services are unavailable', async () => {
    await renderWithProviders(<ActiveMotionStatus language={LANGUAGES.russian} />, { store: mockStore });

    await act(async () => {
      [0, 1_000, 2_000, 31_000, 32_000].forEach((timestamp) => {
        currentTimestamp = timestamp;
        listener({ x: 0, y: 0, z: 1 });
      });
    });

    expect(screen.getByText(ACTIVITY_MOTION_STATUS.russian.title)).toBeOnTheScreen();
    expect(screen.getByText(ACTIVITY_MOTION_STATUS.russian.basedOn('акселерометра'))).toBeOnTheScreen();
  });
});
