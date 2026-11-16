import { act, renderHook } from '@testing-library/react-native';
import useAutoModerationRefresh from './use-auto-moderation-refresh';

describe('useAutoModerationRefresh', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('refreshes every eight seconds for at most five attempts', async () => {
    const onRefresh = jest.fn();
    await renderHook(() => useAutoModerationRefresh(true, onRefresh));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(8_000);
    });
    expect(onRefresh).toHaveBeenCalledTimes(1);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(32_000);
    });
    expect(onRefresh).toHaveBeenCalledTimes(5);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(40_000);
    });
    expect(onRefresh).toHaveBeenCalledTimes(5);
  });

  it('does not poll until pending and resets the attempt count after the status clears', async () => {
    const onRefresh = jest.fn();
    const { rerender } = await renderHook(
      ({ pending }: { pending: boolean }) => useAutoModerationRefresh(pending, onRefresh),
      {
        initialProps: { pending: false },
      },
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(40_000);
    });
    expect(onRefresh).not.toHaveBeenCalled();

    await rerender({ pending: true });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(8_000);
    });
    expect(onRefresh).toHaveBeenCalledTimes(1);

    await rerender({ pending: false });
    await rerender({ pending: true });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(8_000);
    });
    expect(onRefresh).toHaveBeenCalledTimes(2);
  });
});
