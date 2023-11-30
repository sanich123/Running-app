import * as auth from '@A/context/auth-context';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { screen, userEvent } from '@testing-library/react-native';

import { GENDER_BTNS, GENDER_BTNS_VALUES } from './const';
import GenderBtns from './gender-btns';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Gender btns', () => {
  it('should correctly handle user pressing', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<GenderBtns isDisabled={false} />, { store: mockStore });
    const maleInput = screen.getByText(GENDER_BTNS.english.maleLabel);
    const femaleInput = screen.getByText(GENDER_BTNS.english.femaleLabel);
    await userEvent.press(maleInput);
    expect(mockStore.getState().profile.settings.gender).toEqual(GENDER_BTNS_VALUES.male);
    await userEvent.press(femaleInput);
    expect(mockStore.getState().profile.settings.gender).toEqual(GENDER_BTNS_VALUES.female);
  });
});
