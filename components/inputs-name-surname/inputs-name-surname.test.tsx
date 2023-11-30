import * as auth from '@A/context/auth-context';
import { setIsDisabledWhileSendingProfile } from '@R/profile/profile';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen, userEvent } from '@testing-library/react-native';

import { NAME_TEST_ID, SURNAME_TEST_ID } from './const';
import InputsNameSurname from './inputs-name-surname';

describe('Inputs name-surname', () => {
  it('should correctly handle user typing', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<InputsNameSurname isDisabled={false} />, { store: mockStore });
    const inputName = screen.getByTestId(NAME_TEST_ID);
    const inputSurname = screen.getByTestId(SURNAME_TEST_ID);
    await userEvent.type(inputName, 'Vova');
    expect(mockStore.getState().profile.settings.name).toEqual('Vova');

    await userEvent.type(inputSurname, 'Putin');
    expect(mockStore.getState().profile.settings.surname).toEqual('Putin');
  });
  it('should correctly handle isDisableWhileSending', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    renderWithProviders(<InputsNameSurname isDisabled={false} />, { store: mockStore });
    const inputName = screen.getByTestId(NAME_TEST_ID);
    const inputSurname = screen.getByTestId(SURNAME_TEST_ID);
    expect(inputName).toBeDisabled();
    expect(inputSurname).toBeDisabled();
  });
  it('should correctly handle isDisabled', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<InputsNameSurname isDisabled />, {
      store: mockStore,
    });
    const inputName = screen.getByTestId(NAME_TEST_ID);
    const inputSurname = screen.getByTestId(SURNAME_TEST_ID);
    expect(inputName).toBeDisabled();
    expect(inputSurname).toBeDisabled();
  });
  it('should correctly renders', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<InputsNameSurname isDisabled={false} />, { store: mockStore });
    expect(screen.getByTestId(NAME_TEST_ID)).toBeOnTheScreen();
    expect(screen.getByTestId(SURNAME_TEST_ID)).toBeOnTheScreen();
  });
});
