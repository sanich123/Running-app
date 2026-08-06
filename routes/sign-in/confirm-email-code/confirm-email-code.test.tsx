import { act, waitFor } from '@testing-library/react-native';
import { http } from 'msw';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ConfirmEmailCode from './confirm-email-code';

const mockReplace = jest.fn();
let mockConfirmationInputProps: { disabled: boolean; onChangeText: (value: string) => void };
let mockConfirmationSubmitProps: { disabled: boolean; onPress: () => Promise<void> };

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  const { View } = jest.requireActual('react-native');

  return {
    ...actual,
    TextInput: (props: typeof mockConfirmationInputProps & { testID: string }) => {
      mockConfirmationInputProps = props;
      return <View testID={props.testID} />;
    },
    Button: (props: typeof mockConfirmationSubmitProps & { testID: string }) => {
      mockConfirmationSubmitProps = props;
      return <View testID={props.testID} />;
    },
  };
});

const mockWatch = jest.fn(() => 'runich.mock.runner.01@runich.app') as any;

describe('ConfirmEmailCode', () => {
  it('submits a code and navigates after success', async () => {
    await renderWithProviders(<ConfirmEmailCode watch={mockWatch} />);
    await act(async () => mockConfirmationInputProps.onChangeText('123456'));
    await act(async () => mockConfirmationSubmitProps.onPress());
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
    expect(mockWatch).toHaveBeenCalledWith('email');
    expect(mockStoreUserId()).toBe(MOCK_SERVER_IDS.userId);
  });

  it('disables controls while the request is loading', async () => {
    server.use(http.post(`${BASE_URL}/auth/confirm-email`, loadingResponse));
    await renderWithProviders(<ConfirmEmailCode watch={mockWatch} />);
    await act(async () => mockConfirmationInputProps.onChangeText('123456'));
    await act(async () => {
      void mockConfirmationSubmitProps.onPress();
      await Promise.resolve();
    });
    await waitFor(() => expect(mockConfirmationInputProps.disabled).toBe(true));
    expect(mockConfirmationSubmitProps.disabled).toBe(true);
  });
});

function mockStoreUserId() {
  return mockStore.getState().auth.userId;
}
