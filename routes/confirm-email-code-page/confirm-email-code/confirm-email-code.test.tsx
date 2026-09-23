import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ROUTES } from '@const/enums';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ConfirmEmailCode from './confirm-email-code';

const mockPush = jest.fn();
const mockDismissTo = jest.fn();
let mockConfirmationInputProps: { disabled: boolean; onChangeText: (value: string) => void };
let mockConfirmationSubmitProps: { disabled: boolean; onPress: () => Promise<void> };

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    dismissTo: mockDismissTo,
  }),
}));
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

const mockEmail = 'runich.mock.runner.01@runich.app';

describe('ConfirmEmailCode', () => {
  it('submits a code and navigates after success', async () => {
    await renderWithProviders(<ConfirmEmailCode email={mockEmail} />);
    await act(async () => mockConfirmationInputProps.onChangeText('123456'));
    await waitFor(() => expect(mockConfirmationSubmitProps.disabled).toBe(false));
    await act(async () => mockConfirmationSubmitProps.onPress());
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => expect(mockDismissTo).toHaveBeenCalledWith(`/${ROUTES.tabs}/(home)`));
    expect(mockStore.getState().auth.accessToken).toBe('test-access-token');
  });

  it('disables controls while the request is loading', async () => {
    server.use(http.post(`${BASE_URL}/auth/confirm-email`, loadingResponse));
    await renderWithProviders(<ConfirmEmailCode email={mockEmail} />);
    await act(async () => mockConfirmationInputProps.onChangeText('123456'));
    await waitFor(() => expect(mockConfirmationSubmitProps.disabled).toBe(false));
    await act(async () => {
      void mockConfirmationSubmitProps.onPress();
      await Promise.resolve();
    });
    await waitFor(() => expect(mockConfirmationInputProps.disabled).toBe(true));
    expect(mockConfirmationSubmitProps.disabled).toBe(true);
  });

  it('verifies a password change code and opens the change password page', async () => {
    let requestBody: unknown;
    server.use(
      http.post(`${BASE_URL}/auth/verify-password-change-code`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ message: 'Code verified' });
      }),
    );

    await renderWithProviders(<ConfirmEmailCode email={mockEmail} type="change-password" />);
    await act(async () => mockConfirmationInputProps.onChangeText(' 123456 '));
    await waitFor(() => expect(mockConfirmationSubmitProps.disabled).toBe(false));
    await act(async () => mockConfirmationSubmitProps.onPress());

    await waitFor(() => expect(requestBody).toEqual({ email: mockEmail, confirmationCode: '123456' }));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: `/${ROUTES.changePassword}`,
      params: { email: mockEmail },
    });
  });
});
