import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import Intro from './intro';

describe('intro', () => {
  it('renders the localized welcome copy', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<Intro />);
    expect(screen.getByText('Welcome to runich!')).toBeOnTheScreen();
    expect(screen.getByText('Sport is cool!')).toBeOnTheScreen();
  });
});
