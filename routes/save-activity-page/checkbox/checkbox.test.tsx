import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import Checkbox from './checkbox';
import { CHECKBOX } from './const';

const mockSetParams = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ mode: 'manual' }),
  useRouter: () => ({ setParams: mockSetParams }),
}));

describe('Checkbox', () => {
  it('selects followers by default', async () => {
    await renderWithProviders(<Checkbox />);
    expect(screen.getByTestId('activity-visibility-followers').props.accessibilityState?.selected).toBe(true);
  });

  it('should correctly renders in russia', async () => {
    await renderWithProviders(<Checkbox />, { store: mockStore });
    expect(screen.getByText(CHECKBOX.russian.public)).toBeOnTheScreen();
  });
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<Checkbox />, { store: mockStore });
    expect(screen.getByText(CHECKBOX.english.public)).toBeOnTheScreen();
  });

  it('changes activity visibility', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<Checkbox />);
    await fireEvent.press(screen.getByText(CHECKBOX.russian.followers));
    expect(mockSetParams).toHaveBeenCalledWith({ visibility: 'followers' });
  });
});
