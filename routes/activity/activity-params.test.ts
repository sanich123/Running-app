import { renderHook } from '@testing-library/react-native';
import { useActivitySportParams } from './activity-params';

const mockLocalParams = { current: { sport: ['trail', 'run'] } };

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockLocalParams.current,
  useGlobalSearchParams: () => mockLocalParams.current,
  useRouter: () => ({ setParams: jest.fn() }),
}));

describe('activity sport params', () => {
  it('uses the first sport when the router provides repeated params', async () => {
    const { result } = await renderHook(() => useActivitySportParams());

    expect(result.current.sport).toBe('trail');
  });
});
