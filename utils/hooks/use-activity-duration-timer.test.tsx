import { act, screen } from '@testing-library/react-native';
import { AppState, Text } from 'react-native';
import { STATUSES } from '@const/enums';
import { resetLocationSlice, setActivityStatus, stopDurationTimer } from '@R/slices/location/location';
import { useAppSelector } from '@R/typed-hooks';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import useActivityDurationTimer from './use-activity-duration-timer';

function TimerHarness() {
  useActivityDurationTimer();
  const duration = useAppSelector(({ location }) => location.duration);
  return <Text testID="duration">{duration}</Text>;
}

describe('useActivityDurationTimer', () => {
  beforeEach(() => {
    mockStore.dispatch(resetLocationSlice());
    jest.setSystemTime(1_000);
  });

  it('updates the activity duration every second without a location update', async () => {
    await act(async () => {
      mockStore.dispatch(setActivityStatus(STATUSES.started));
    });
    await renderWithProviders(<TimerHarness />, { store: mockStore });

    expect(screen.getByTestId('duration')).toHaveTextContent('0');

    await act(async () => {
      jest.advanceTimersByTime(3_000);
    });

    expect(screen.getByTestId('duration')).toHaveTextContent('3000');
    expect(mockStore.getState().location.durationTimerStartedAt).toBe(1_000);
  });

  it('stops advancing after the activity is paused', async () => {
    await act(async () => {
      mockStore.dispatch(setActivityStatus(STATUSES.started));
    });
    const { rerender } = await renderWithProviders(<TimerHarness />, { store: mockStore });

    await act(async () => {
      jest.advanceTimersByTime(2_000);
    });
    await act(async () => {
      mockStore.dispatch(setActivityStatus(STATUSES.paused));
    });
    await act(async () => {
      rerender(<TimerHarness />);
    });
    await act(async () => {
      jest.advanceTimersByTime(2_000);
    });

    expect(mockStore.getState().location.duration).toBe(2_000);
  });

  it('catches up from wall-clock time when the app returns to foreground', async () => {
    await act(async () => {
      mockStore.dispatch(setActivityStatus(STATUSES.started));
    });
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');
    await renderWithProviders(<TimerHarness />, { store: mockStore });
    const changeListener = addEventListenerSpy.mock.calls[0][1] as (state: string) => void;

    jest.setSystemTime(6_000);
    await act(async () => {
      changeListener('active');
    });

    expect(mockStore.getState().location.duration).toBe(5_000);
    addEventListenerSpy.mockRestore();
  });

  it('ignores non-active app state changes and stopped timers', async () => {
    await act(async () => {
      mockStore.dispatch(setActivityStatus(STATUSES.started));
    });
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');
    const remove = jest.fn();
    addEventListenerSpy.mockReturnValue({ remove } as never);
    const { unmount } = await renderWithProviders(<TimerHarness />, { store: mockStore });
    const changeListener = addEventListenerSpy.mock.calls[0][1] as (state: string) => void;

    await act(async () => {
      mockStore.dispatch(stopDurationTimer());
      jest.setSystemTime(6_000);
      changeListener('background');
      changeListener('active');
    });

    expect(mockStore.getState().location.duration).toBe(0);
    unmount();
    addEventListenerSpy.mockRestore();
  });
});
