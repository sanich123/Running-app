import { act, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES, ROUTES } from '@const/enums';
import { saveEmail } from '@R/slices/logining/logining';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { CONFIRM_EMAIL_CODE_TEST_ID } from './confirm-email-code/const';
import ConfirmEmailCodePage from './confirm-email-code-page';
import { CONFIRM_EMAIL_PAGE_TEXT } from './const';

const mockReplace = jest.fn();
const mockSearchParams: { email?: string; type?: string } = {};
let mockConfirmationInputProps: { onChangeText: (value: string) => void };
let mockConfirmationSubmitProps: { onPress: () => Promise<void>; disabled?: boolean };

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockSearchParams,
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

describe('ConfirmEmailCodePage', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSearchParams.email = 'runner@example.test';
    mockSearchParams.type = 'registration';
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(saveEmail('runner@example.test'));
  });

  it('only submits the code and email, saves the returned access token and opens the home page', async () => {
    let requestBody: unknown;
    server.use(
      http.post(`${BASE_URL}/auth/confirm-email`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ accessToken: 'access-token' });
      }),
    );

    await renderWithProviders(<ConfirmEmailCodePage />, { store: mockStore });

    expect(screen.getByText(CONFIRM_EMAIL_PAGE_TEXT.russian.title)).toBeOnTheScreen();
    expect(screen.getByTestId(CONFIRM_EMAIL_CODE_TEST_ID.input)).toBeOnTheScreen();
    expect(screen.getByText(CONFIRM_EMAIL_PAGE_TEXT.russian.spam)).toBeOnTheScreen();

    await act(async () => mockConfirmationInputProps.onChangeText(' 123456 '));
    await waitFor(() => expect(mockConfirmationSubmitProps.disabled).toBe(false));
    expect(mockConfirmationSubmitProps.disabled).toBe(false);
    await act(async () => Promise.resolve());
    await act(async () => mockConfirmationSubmitProps.onPress());

    await waitFor(() => expect(requestBody).toEqual({ email: 'runner@example.test', confirmationCode: '123456' }));
    expect(mockStore.getState().auth.accessToken).toBe('access-token');
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
  });

  it('does not navigate when the code confirmation fails', async () => {
    server.use(
      http.post(`${BASE_URL}/auth/confirm-email`, () =>
        HttpResponse.json({ message: 'Invalid code' }, { status: 400 }),
      ),
    );

    await renderWithProviders(<ConfirmEmailCodePage />, { store: mockStore });
    await act(async () => mockConfirmationInputProps.onChangeText('000000'));
    await waitFor(() => expect(mockConfirmationSubmitProps.disabled).toBe(false));
    await act(async () => mockConfirmationSubmitProps.onPress());

    await waitFor(() => expect(mockReplace).not.toHaveBeenCalledWith(ROUTES.root));
  });
});
