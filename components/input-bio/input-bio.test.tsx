import * as auth from '@A/context/auth-context';
import { setIsDisabledWhileSendingProfile } from '@R/profile/profile';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen, userEvent } from '@testing-library/react-native';

import { INPUT_BIO_TEST_ID } from './const';
import InputBio from './input-bio';

describe('Input bio', () => {
  it('should correctly renders', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<InputBio isDisabled={false} />, { store: mockStore });
    const textInput = screen.getByTestId(INPUT_BIO_TEST_ID);
    expect(textInput).toBeOnTheScreen();
    await userEvent.type(textInput, 'some text');
    expect(mockStore.getState().profile.settings.bio).toEqual('some text');
  });
  it('should correctly handle isDisabledWhenSendingProfile state', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    renderWithProviders(<InputBio isDisabled={false} />, { store: mockStore });
    const bioInput = screen.getByTestId(INPUT_BIO_TEST_ID);
    expect(bioInput).toBeDisabled();
    expect(await screen.findAllByText(/bio/i)).toHaveLength(3);
  });
  it('should correctly handle isDisabled state', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<InputBio isDisabled />, { store: mockStore });
    const bioInput = screen.getByTestId(INPUT_BIO_TEST_ID);
    expect(bioInput).toBeDisabled();
    expect(await screen.findAllByText(/bio/i)).toHaveLength(3);
  });
});
