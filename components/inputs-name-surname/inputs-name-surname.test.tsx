import { screen, userEvent } from '@testing-library/react-native';

import { NAME_TEST_ID, SURNAME_TEST_ID } from './const';
import InputsNameSurname from './inputs-name-surname';
import { setIsDisabledWhileSendingProfile } from '../../redux/profile/profile';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Inputs name-surname', () => {
  it('should correctly renders', () => {
    renderWithProviders(
      <InputsNameSurname name="" surname="" setName={jest.fn()} setSurname={jest.fn()} isDisabled={false} />,
      { store: mockStore },
    );
    expect(screen.getByTestId(NAME_TEST_ID)).toBeOnTheScreen();
    expect(screen.getByTestId(SURNAME_TEST_ID)).toBeOnTheScreen();
  });
  it('should correctly handle user typing', async () => {
    const setNameFn = jest.fn();
    const setSurnameFn = jest.fn();
    renderWithProviders(
      <InputsNameSurname name="" surname="" setName={setNameFn} setSurname={setSurnameFn} isDisabled={false} />,
      { store: mockStore },
    );
    const inputName = screen.getByTestId(NAME_TEST_ID);
    const inputSurname = screen.getByTestId(SURNAME_TEST_ID);
    await userEvent.type(inputName, 'Vova');
    expect(setNameFn).toHaveBeenCalledTimes(4);
    await userEvent.type(inputSurname, 'Putin');
    expect(setSurnameFn).toHaveBeenCalledTimes(5);
  });
  it('should correctly handle isDisableWhileSending', async () => {
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    const setNameFn = jest.fn();
    const setSurnameFn = jest.fn();
    renderWithProviders(
      <InputsNameSurname name="" surname="" setName={setNameFn} setSurname={setSurnameFn} isDisabled={false} />,
      { store: mockStore },
    );
    const inputName = screen.getByTestId(NAME_TEST_ID);
    const inputSurname = screen.getByTestId(SURNAME_TEST_ID);
    expect(inputName).toBeDisabled();
    expect(inputSurname).toBeDisabled();
  });
  it('should correctly handle isDisabled', async () => {
    const setNameFn = jest.fn();
    const setSurnameFn = jest.fn();
    renderWithProviders(
      <InputsNameSurname name="" surname="" setName={setNameFn} setSurname={setSurnameFn} isDisabled />,
      {
        store: mockStore,
      },
    );
    const inputName = screen.getByTestId(NAME_TEST_ID);
    const inputSurname = screen.getByTestId(SURNAME_TEST_ID);
    expect(inputName).toBeDisabled();
    expect(inputSurname).toBeDisabled();
  });
});
