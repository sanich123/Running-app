import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/language/language';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { UPDATE_BTN, UPDATE_BTN_ERROR_MSG } from './const';
import ProfileUpdateBtn from './update-btn';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: mockBack }),
}));
describe('Profile update btn', () => {
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    expect(await screen.findByText(UPDATE_BTN.english.update)).toBeOnTheScreen();
  });
  it('should correctly interract with the user', async () => {
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    const updateBtn = await screen.findByText(UPDATE_BTN.english.update);
    expect(mockStore.getState().profile.isDisabledWhileSendingProfile).toEqual(false);
    await userEvent.press(updateBtn);
    expect(mockStore.getState().profile.isDisabledWhileSendingProfile).toEqual(false);
  });

  it('returns to the profile after successfully updating it', async () => {
    mockBack.mockClear();
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    const updateBtn = await screen.findByText(UPDATE_BTN.english.update);
    await userEvent.press(updateBtn);
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });

  it('creates a missing profile when the server returns an empty success response', async () => {
    const user = userEvent.setup();
    const userId = 'profile-without-profile';
    mockStore.dispatch(setUserId(userId));
    server.use(
      http.get(`${BASE_URL}/user/${userId}/profile`, () => HttpResponse.json(null)),
      http.post(`${BASE_URL}/user/${userId}/profile`, () => new HttpResponse(null, { status: 204 })),
    );

    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    const createButton = await screen.findByText(UPDATE_BTN.english.create);
    await user.press(createButton);

    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    expect(screen.queryByText(UPDATE_BTN_ERROR_MSG)).not.toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setUserId('someUserId'));
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    expect(await screen.findByText(UPDATE_BTN.russian.update)).toBeOnTheScreen();
  });
});
