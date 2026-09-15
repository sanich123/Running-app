import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { UPDATE_BTN, UPDATE_BTN_ERROR_MSG } from './const';
import ProfileUpdateBtn from './update-btn';

const mockBack = jest.fn();
const mockProfileSettingsParams = {
  name: '',
  surname: '',
  weight: '',
  city: '',
  bio: '',
  gender: '',
};
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockProfileSettingsParams,
  useGlobalSearchParams: () => mockProfileSettingsParams,
  useRouter: () => ({ push: jest.fn(), back: mockBack }),
}));
describe('Profile update btn', () => {
  beforeEach(() => {
    mockBack.mockClear();
    Object.assign(mockProfileSettingsParams, {
      name: '',
      surname: '',
      weight: '',
      city: '',
      bio: '',
      gender: '',
    });
  });

  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    expect(await screen.findByText(UPDATE_BTN.english.update)).toBeOnTheScreen();
  });
  it('should correctly interract with the user', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    const updateBtn = await screen.findByText(UPDATE_BTN.english.update);
    await userEvent.press(updateBtn);
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });

  it('returns to the profile after successfully updating it', async () => {
    mockBack.mockClear();
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    const updateBtn = await screen.findByText(UPDATE_BTN.english.update);
    await userEvent.press(updateBtn);
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });

  it('updates the empty profile returned by the server', async () => {
    const user = userEvent.setup();
    const userId = 'profile-without-profile';
    mockStore.dispatch(setMockUserId(userId));
    server.use(
      http.get(`${BASE_URL}/user/${userId}/profile`, () => HttpResponse.json({ id: 'profile-id', userId: userId })),
      http.patch(`${BASE_URL}/user/${userId}/profile`, () => HttpResponse.json({ id: 'profile-id', userId: userId })),
    );

    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    const updateButton = await screen.findByText(UPDATE_BTN.english.update);
    await user.press(updateButton);

    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    expect(screen.queryByText(UPDATE_BTN_ERROR_MSG)).not.toBeOnTheScreen();
  });

  it('uses the current form values from the profile route params', async () => {
    let requestBody: unknown;
    const user = userEvent.setup();
    const userId = 'layout-profile-user';
    mockStore.dispatch(setMockUserId(userId));
    server.use(
      http.get(`${BASE_URL}/user/${userId}/profile`, () => HttpResponse.json({ id: 'profile-id', userId: userId })),
      http.patch(`${BASE_URL}/user/${userId}/profile`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'profile-id', userId: userId });
      }),
    );

    Object.assign(mockProfileSettingsParams, {
      name: 'Updated name',
      surname: 'Updated surname',
      weight: '80',
      city: 'Moscow',
      bio: 'Updated bio',
      gender: 'MALE',
    });
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    await user.press(await screen.findByText(UPDATE_BTN.english.update));

    await waitFor(() => expect(requestBody).toEqual(expect.objectContaining({ name: 'Updated name' })));
    expect(requestBody).toEqual(
      expect.objectContaining({
        name: 'Updated name',
        surname: 'Updated surname',
        weight: '80',
        city: 'Moscow',
        bio: 'Updated bio',
        gender: 'MALE',
      }),
    );
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<ProfileUpdateBtn />, { store: mockStore });
    expect(await screen.findByText(UPDATE_BTN.russian.update)).toBeOnTheScreen();
  });
});
