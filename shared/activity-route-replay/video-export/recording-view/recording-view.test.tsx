import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
jest.mock('react-native-view-recorder', () => {
  const { View } = require('react-native');
  return { RecordingView: View, useViewRecorder: jest.fn() };
});
import ReplayRecordingView from './recording-view';

describe('ReplayRecordingView', () => {
  it('renders its child content inside the recording view', async () => {
    const { getByTestId } = await render(
      <ReplayRecordingView sessionId="test-session">
        <Text testID="replay-recording-content">Replay map</Text>
      </ReplayRecordingView>,
    );

    expect(getByTestId('replay-recording-content')).toHaveTextContent('Replay map');
  });
});
