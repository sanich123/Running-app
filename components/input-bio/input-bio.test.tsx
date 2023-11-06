import { screen, userEvent } from '@testing-library/react-native';

import InputBio from './input-bio';
import { setIsDisabledWhileSendingProfile } from '../../redux/profile/profile';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Input bio', () => {
  it('should correctly renders', () => {
    renderWithProviders(<InputBio bio="some bio" setBio={jest.fn()} isDisabled={false} />, { store: mockStore });
    expect(screen.getByTestId('inputBio')).toBeOnTheScreen();
  });
  it('should correctly handle user input', async () => {
    const setBioFn = jest.fn();
    renderWithProviders(<InputBio bio="" setBio={setBioFn} isDisabled={false} />, { store: mockStore });
    const bioInput = screen.getByTestId('inputBio');
    await userEvent.type(bioInput, 'some text');
    expect(setBioFn).toHaveBeenCalledTimes(9);
  });
  it('should correctly handle isDisabledWhenSendingProfile state', () => {
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    const setBioFn = jest.fn();
    renderWithProviders(<InputBio bio="" setBio={setBioFn} isDisabled={false} />, { store: mockStore });
    const bioInput = screen.getByTestId('inputBio');
    expect(bioInput).toBeDisabled();
  });
  it('should correctly handle isDisabled state', () => {
    const setBioFn = jest.fn();
    renderWithProviders(<InputBio bio="" setBio={setBioFn} isDisabled />, { store: mockStore });
    const bioInput = screen.getByTestId('inputBio');
    expect(bioInput).toBeDisabled();
  });
});
