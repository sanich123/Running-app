import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { setIsDisabledWhileSendingProfile } from '@R/slices/profile/profile';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { INPUT_BIO_TEST_ID } from './const';
import InputBio from './input-bio';

describe('Input bio', () => {
  it('should correctly renders', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<InputBio isDisabled={false} />, { store: mockStore });
    const textInput = screen.getByTestId(INPUT_BIO_TEST_ID);
    expect(textInput).toBeOnTheScreen();
    await userEvent.type(textInput, 'some text');
    expect(mockStore.getState().profile.settings.bio).toEqual('some text');
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
