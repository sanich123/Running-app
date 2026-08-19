import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setIsDisabledWhileSendingProfile } from '@R/slices/profile/profile';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { INPUT_BIO_TEST_ID } from './const';
import InputBio from './input-bio';

const mockParams = { bio: '' };
const mockSetParams = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ setParams: mockSetParams }),
}));

describe('Input bio', () => {
  beforeEach(() => {
    mockParams.bio = '';
    mockStore.dispatch(setIsDisabledWhileSendingProfile(false));
  });

  it('should render and update the value from local search params', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockParams.bio = 'Existing bio';
    await renderWithProviders(<InputBio isDisabled={false} />, { store: mockStore });
    const textInput = screen.getByTestId(INPUT_BIO_TEST_ID);
    expect(textInput).toBeOnTheScreen();
    expect(textInput.props.value).toEqual('Existing bio');
    textInput.props.onChangeText('some text');
    expect(mockSetParams).toHaveBeenCalledWith({ bio: 'some text' });
  });
  it('should correctly handle isDisabledWhenSendingProfile state', async () => {
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<InputBio isDisabled={false} />, { store: mockStore });
    const bioInput = screen.getByTestId(INPUT_BIO_TEST_ID);
    expect(bioInput).toBeDisabled();
    expect(await screen.findAllByText(/bio/i)).toHaveLength(2);
  });
  it('should correctly handle isDisabled state', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<InputBio isDisabled />, { store: mockStore });
    const bioInput = screen.getByTestId(INPUT_BIO_TEST_ID);
    expect(bioInput).toBeDisabled();
    expect(await screen.findAllByText(/bio/i)).toHaveLength(2);
  });
});
