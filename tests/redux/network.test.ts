import { MOCK_NETWORK_STATE } from '../../components/network-indicator/const';
import reducer, { NETWORK_INITIAL_STATE, changeNetworkState } from '../../redux/network/network';

describe('Network slice', () => {
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(NETWORK_INITIAL_STATE);
  });
  it('should change network state', () => {
    expect(reducer(undefined, changeNetworkState(MOCK_NETWORK_STATE))).toEqual({ networkState: MOCK_NETWORK_STATE });
  });
});
