import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { INTRO } from './const';
import Intro from './intro';

describe('intro', () => {
  it('renders the localized welcome copy', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<Intro />);
    expect(screen.getByText(INTRO[LANGUAGES.english].welcome)).toBeOnTheScreen();
    expect(screen.getByText(INTRO[LANGUAGES.english].coolSlogan)).toBeOnTheScreen();
  });
});
