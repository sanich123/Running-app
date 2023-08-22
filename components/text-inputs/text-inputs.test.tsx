import { render, screen, userEvent } from '@testing-library/react-native';
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
  const setTitle = jest.fn();
  const setDescription = jest.fn();
  const user = userEvent.setup();
  it('should correctly renders and interract with the user', async () => {
    render(
      <PaperProvider theme={theme}>
        <TextInputs
          setTitle={setTitle}
          setDescription={setDescription}
          title={TITLE_PLACEHOLDER}
          description={DESCRIPTION_PLACEHOLDER}
        />
      </PaperProvider>,
    );
    const titleTextInput = screen.getByPlaceholderText(TITLE_PLACEHOLDER);
    const descriptionTextInput = screen.getByPlaceholderText(DESCRIPTION_PLACEHOLDER);
    expect(titleTextInput).toBeDefined();
    expect(descriptionTextInput).toBeDefined();
    await user.type(titleTextInput, 'Some text');
    expect(setTitle).toHaveBeenCalledTimes(9);
    await user.type(descriptionTextInput, 'Another text');
    expect(setDescription).toHaveBeenCalledTimes(12);
  });
});
