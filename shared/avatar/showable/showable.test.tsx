import { http } from 'msw';
import { screen } from '@testing-library/react-native';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { AvatarShowableTestIds } from './const';
import AvatarShowable from './showable';
describe('Avatar showable', () => {
  it('shows a loading indicator while the profile is loading', async () => {
    server.use(http.get(`${BASE_URL}/user/loading-profile-user/profile`, loadingResponse));

    await renderWithProviders(<AvatarShowable size={25} id="loading-profile-user" />, { store: mockStore });

    expect(screen.getByTestId(AvatarShowableTestIds.isLoading)).toBeOnTheScreen();
  });

  it('should correctly handle isLoading and success state', async () => {
    await renderWithProviders(<AvatarShowable size={25} id="someUserId" />, { store: mockStore });
    expect(await screen.findByTestId(AvatarShowableTestIds.success)).toBeOnTheScreen();
  });
  it('should correctly handle isLoading and error state', async () => {
    await renderWithProviders(<AvatarShowable size={25} id="someUserIdWithAnError" />, { store: mockStore });
    expect(await screen.findByTestId(AvatarShowableTestIds.error)).toBeOnTheScreen();
  });
  it('should render a default icon, when !error !isLoading !profile', async () => {
    await renderWithProviders(<AvatarShowable size={25} id="someUserIdWithoutPhoto" />, { store: mockStore });
    expect(await screen.findByTestId(AvatarShowableTestIds.default)).toBeOnTheScreen();
  });
});
