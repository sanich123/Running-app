import { render, screen } from '@testing-library/react-native';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

import TextInputs from './text-inputs';
import { TITLE_PLACEHOLDER, DESCRIPTION_PLACEHOLDER } from './text-inputs-const';

jest.useFakeTimers();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: 'tomato',
    secondary: 'yellow',
  },
};
describe('TextInputs, save-activity page', () => {
  it('should correctly renders and interract with the user', async () => {
    render(
      <PaperProvider theme={theme}>
        <TextInputs />
      </PaperProvider>,
    );
    const titleTextInput = screen.getByPlaceholderText(TITLE_PLACEHOLDER);
    const descriptionTextInput = screen.getByPlaceholderText(DESCRIPTION_PLACEHOLDER);
    expect(titleTextInput).toBeDefined();
    expect(descriptionTextInput).toBeDefined();
  });
});
