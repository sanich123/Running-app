import { screen, userEvent } from '@testing-library/react-native';

import ActivitySaveBtn from './activity-save-btn';
import * as auth from '../../auth/context/auth-context';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Activity save btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ActivitySaveBtn />);
    expect(screen.getByText(/save/i)).toBeDefined();
  });
  it('should correctly change global state', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        app_metadata: undefined,
        user_metadata: undefined,
        aud: '',
        created_at: '',
      },
    }));
    renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    const saveBtn = screen.getByTestId(/activitySaveBtn/i);
    expect(mockStore.getState().activity.isDisabledWhileSending).toEqual(false);
    await userEvent.press(saveBtn);
    expect(mockStore.getState().activity.isNeedToResetInputs).toEqual(true);
  });
  // it('should correctly change global state, when receive an error', async () => {
  //   jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
  //     user: {
  //       id: 'someWrongUserId',
  //       app_metadata: undefined,
  //       user_metadata: undefined,
  //       aud: '',
  //       created_at: '',
  //     },
  //   }));
  //   renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
  //   const saveBtn = screen.getByTestId(/activitySaveBtn/i);
  //   expect(mockStore.getState().activity.isDisabledWhileSending).toEqual(false);
  //   await userEvent.press(saveBtn);
  //   expect(mockStore.getState().activity.isNeedToResetInputs).toEqual(false);
  // });
});
