import { screen } from '@testing-library/react-native';

import UserCityAge from '../../components/user-city-age/user-city-age';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { MOCK_PROFILE } from '../mocks/mock-location';
import { MOCK_BAD_REQUEST } from '../mocks/mock-requests';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';
describe('User city age', () => {
  it('should correctly renders', async () => {
    renderWithProviders(<UserCityAge userId="someUserId" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(MOCK_PROFILE.city)).toBeOnTheScreen();
  });
  it('should correctly handle an error in english', async () => {
    renderWithProviders(<UserCityAge userId="someUserIdWithAnError" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(`An error: ${MOCK_BAD_REQUEST.status}`)).toBeOnTheScreen();
  });
  it('should correctly handle an error in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<UserCityAge userId="someUserIdWithAnError" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(`Ошибка: ${MOCK_BAD_REQUEST.status}`)).toBeOnTheScreen();
  });
});
